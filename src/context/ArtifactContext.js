import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useProjects } from './ProjectContext';
import { buildProjectContext, generateTaskList } from '../services/geminiService';
import { format } from 'date-fns';

const ArtifactContext = createContext();

export const useArtifacts = () => useContext(ArtifactContext);

/**
 * ArtifactProvider handles real-time syncing of:
 * 1. Master project artifacts (Project Brief & Task List) -> visible to all
 * 2. Personal drafts -> visible only to the current user
 */
export const ArtifactProvider = ({ children }) => {
    const { user } = useAuth();
    const { getProjectById, getTasksForProject, getTasksForTeam, teams, users } = useProjects();
    
    // State
    const [masterArtifacts, setMasterArtifacts] = useState({}); // { [projectId_type]: artifactData }
    const [userDrafts, setUserDrafts] = useState({});           // { [projectId_type]: draftData }
    const [isDraftsLoaded, setIsDraftsLoaded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Listen to personal drafts (users/{userId}/drafts)
    useEffect(() => {
        if (!user) {
            setUserDrafts({});
            return;
        }

        const draftsRef = collection(db, `users/${user.id}/drafts`);
        const unsubDrafts = onSnapshot(draftsRef, (snapshot) => {
            const draftsObj = {};
            snapshot.docs.forEach(doc => {
                draftsObj[doc.id] = { id: doc.id, ...doc.data() };
            });
            setUserDrafts(draftsObj);
            setIsDraftsLoaded(true);
        });

        return () => unsubDrafts();
    }, [user]);

    // We only actively listen to artifacts for projects the user opens, 
    // but for simplicity in this MVP, we'll listen to all active projects the user has access to.
    // In a real app, you'd subscribe per-project when the user views it.
    useEffect(() => {
        if (!user) {
            setMasterArtifacts({});
            return;
        }

        // Ideally we query `projects/*/artifacts` using a collectionGroup query, 
        // but for now we'll do an elegant fallback: we subscribe on demand when requested,
        // or just expose a method to fetch them. To keep it fully real-time like ProjectContext,
        // we'll load them all (assuming small MVP).
        
        const unsubscribes = [];
        
        // This is a simplified approach: we assume ProjectContext has loaded `projects`.
        // We'll export a function to subscribe to a specific project's artifacts instead 
        // to avoid N+1 queries.
        
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user]);

    // ─────────────────────────────────────────
    // Active Subscription Mechanism
    // ─────────────────────────────────────────
    const [activeProjectId, setActiveProjectId] = useState(null);

    useEffect(() => {
        if (!activeProjectId) return;

        const artifactsRef = collection(db, `projects/${activeProjectId}/artifacts`);
        const unsub = onSnapshot(artifactsRef, (snapshot) => {
            setMasterArtifacts(prev => {
                const updated = { ...prev };
                snapshot.docs.forEach(doc => {
                    updated[`${activeProjectId}_${doc.id}`] = { id: doc.id, ...doc.data() };
                });
                return updated;
            });
        });

        return () => unsub();
    }, [activeProjectId]);

    const subscribeToProjectArtifacts = (projectId) => {
        setActiveProjectId(projectId);
    };

    // ─────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────

    const getMasterArtifact = (projectId, type) => {
        return masterArtifacts[`${projectId}_${type}`] || null;
    };

    const getUserDraft = (projectId, type) => {
        return userDrafts[`${projectId}_${type}`] || null;
    };

    /**
     * Gets the unified workspace data (chat history)
     */
    const getUserWorkspace = (projectId) => {
        return userDrafts[`${projectId}_workspace`] || null;
    };

    /**
     * Saves both drafts and the shared chat history to Firestore in parallel.
     */
    const saveUnifiedDrafts = async (projectId, briefContent, taskListContent, chatHistory = []) => {
        if (!user) return;
        try {
            const briefRef = doc(db, `users/${user.id}/drafts`, `${projectId}_main`);
            const taskRef = doc(db, `users/${user.id}/drafts`, `${projectId}_tasklist`);
            const workspaceRef = doc(db, `users/${user.id}/drafts`, `${projectId}_workspace`);
            
            const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
            
            const updates = [];
            
            if (briefContent !== null) {
                updates.push(setDoc(briefRef, { projectId, type: 'main', content: briefContent, updatedAt: now }, { merge: true }));
            }
            if (taskListContent !== null) {
                updates.push(setDoc(taskRef, { projectId, type: 'tasklist', content: taskListContent, updatedAt: now }, { merge: true }));
            }
            
            // Save the shared workspace state
            updates.push(setDoc(workspaceRef, { projectId, chatHistory, updatedAt: now }, { merge: true }));
            
            await Promise.all(updates);
        } catch (error) {
            console.error("Error saving unified drafts: ", error);
            throw error;
        }
    };

    /**
     * Saves a personal draft to Firestore
     */
    const saveDraft = async (projectId, type, content, chatHistory = []) => {
        if (!user) return;
        try {
            const draftId = `${projectId}_${type}`;
            const draftRef = doc(db, `users/${user.id}/drafts`, draftId);
            
            await setDoc(draftRef, {
                projectId,
                type,
                content,
                chatHistory,
                updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
            }, { merge: true }); // Merge so we don't overwrite if it exists partially
        } catch (error) {
            console.error("Error saving draft: ", error);
            throw error;
        }
    };

    /**
     * Publishes a draft to the Master Artifact (Lead/Manager only)
     */
    const publishDraft = async (projectId, type, content) => {
        if (!user || (user.role !== 'lead' && user.role !== 'manager')) {
            throw new Error("You do not have permission to publish artifacts.");
        }

        try {
            const artifactRef = doc(db, `projects/${projectId}/artifacts`, type);
            
            const publishRecord = {
                content,
                publishedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                publishedBy: user.id
            };

            await setDoc(artifactRef, {
                content,
                updatedAt: publishRecord.publishedAt,
                updatedBy: user.id,
                versionHistory: arrayUnion(publishRecord)
            }, { merge: true });

        } catch (error) {
            console.error("Error publishing artifact: ", error);
            throw error;
        }
    };

    /**
     * One-shot regeneration of the Task List using Gemini
     */
    const regenerateTaskList = async (projectId) => {
        setIsGenerating(true);
        try {
            // 1. Gather Context
            const project = getProjectById(projectId);
            const tasks = getTasksForProject(projectId);
            
            // Build team details context
            const projectTeams = teams.filter(t => project.teamIds?.includes(t.id));
            
            const projectContext = buildProjectContext(project, tasks, projectTeams, users);

            // 2. Call Gemini
            const generatedMarkdown = await generateTaskList(projectContext);

            // 3. Publish directly to master (this is an admin/lead action)
            await publishDraft(projectId, 'tasklist', generatedMarkdown);

            return true;
        } catch (error) {
            console.error("Regeneration failed:", error);
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ArtifactContext.Provider value={{
            masterArtifacts,
            userDrafts,
            isDraftsLoaded,
            isGenerating,
            setIsGenerating,
            subscribeToProjectArtifacts,
            getMasterArtifact,
            getUserDraft,
            getUserWorkspace,
            saveDraft,
            saveUnifiedDrafts,
            publishDraft,
            regenerateTaskList
        }}>
            {children}
        </ArtifactContext.Provider>
    );
};
