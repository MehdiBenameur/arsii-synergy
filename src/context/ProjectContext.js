import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { format } from 'date-fns';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
            setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubProjects();
            unsubTasks();
            unsubTeams();
            unsubUsers();
            unsubComments();
        };
    }, []);

    // Task Actions
    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                status: newStatus,
                updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
            });
        } catch (error) {
            console.error("Error updating task: ", error);
        }
    };

    const addTask = async (taskData) => {
        try {
            const taskId = `task_${uuid.v4().substring(0, 8)}`;
            const newTask = {
                id: taskId,
                ...taskData,
                status: 'todo',
                createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            };
            await setDoc(doc(db, 'tasks', taskId), newTask);
            return newTask;
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    };

    const addComment = async (commentData) => {
        try {
            const commentId = `comment_${uuid.v4().substring(0, 8)}`;
            const newComment = {
                id: commentId,
                ...commentData,
                createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            };
            await setDoc(doc(db, 'comments', commentId), newComment);
            return newComment;
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    };

    // Project Actions
    const addProject = async (projectData) => {
        try {
            const projectId = `proj_${uuid.v4().substring(0, 8)}`;
            const newProject = {
                id: projectId,
                ...projectData,
                status: 'active',
            };
            await setDoc(doc(db, 'projects', projectId), newProject);
            return newProject;
        } catch (error) {
            console.error("Error adding project: ", error);
        }
    };

    // Selectors 
    const getTasksForUser = (userId) => tasks.filter(t => t.assigneeId === userId);
    const getTasksForProject = (projId) => tasks.filter(t => t.projectId === projId);
    const getTasksForTeam = (teamId) => {
        const memberIds = users.filter(u => u.teamId === teamId).map(u => u.id);
        return tasks.filter(t => memberIds.includes(t.assigneeId));
    };
    const getTasksCreatedBy = (userId) => tasks.filter(t => t.createdBy === userId);

    const getUserById = (id) => users.find(u => u.id === id);
    const getProjectById = (id) => projects.find(p => p.id === id);
    const getCommentsForTask = (taskId) => comments.filter(c => c.taskId === taskId);

    const getProjectProgress = (projectId) => {
        const projTasks = tasks.filter(t => t.projectId === projectId);
        if (projTasks.length === 0) return 0;
        const complete = projTasks.filter(t => t.status === 'done').length;
        return Math.round((complete / projTasks.length) * 100);
    };

    const getTeamProgress = (teamId) => {
        const teamTasks = getTasksForTeam(teamId);
        if (teamTasks.length === 0) return 0;
        const complete = teamTasks.filter(t => t.status === 'done').length;
        return Math.round((complete / teamTasks.length) * 100);
    };

    const getUserWorkload = (userId) => {
        const userTasks = tasks.filter(t => t.assigneeId === userId && t.status !== 'done');
        const count = userTasks.length;
        const todo = userTasks.filter(t => t.status === 'todo').length;
        const inprogress = userTasks.filter(t => t.status === 'inprogress').length;
        return { total: count, todo, inprogress };
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            tasks,
            teams,
            users,
            comments,
            isLoading,
            updateTaskStatus,
            addTask,
            addComment,
            addProject,
            getTasksForUser,
            getTasksForProject,
            getTasksForTeam,
            getTasksCreatedBy,
            getUserById,
            getProjectById,
            getCommentsForTask,
            getProjectProgress,
            getTeamProgress,
            getUserWorkload
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
