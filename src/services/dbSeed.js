import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { USERS, TEAMS, PROJECTS, TASKS, COMMENTS } from '../data/mockData';

export const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed (with wipe)...');

        // 0. Wipe existing data (including subcollections added for AI feature)
        const collectionsToWipe = ['users', 'teams', 'projects', 'tasks', 'comments'];
        for (const colName of collectionsToWipe) {
            console.log(`🧹 Wiping ${colName}...`);
            const snap = await getDocs(collection(db, colName));
            for (const d of snap.docs) {
                // Wipe subcollections first if it's projects or users
                if (colName === 'projects') {
                    const artifactsSnap = await getDocs(collection(db, `projects/${d.id}/artifacts`));
                    for (const a of artifactsSnap.docs) {
                        await deleteDoc(a.ref);
                    }
                }
                if (colName === 'users') {
                    const draftsSnap = await getDocs(collection(db, `users/${d.id}/drafts`));
                    for (const dr of draftsSnap.docs) {
                        await deleteDoc(dr.ref);
                    }
                }
                await deleteDoc(d.ref);
            }
        }
        console.log('✅ Wipe complete');

        // 1. Seed Users
        const usersRef = collection(db, 'users');
        for (const user of USERS) {
            await setDoc(doc(usersRef, user.id), user);
        }
        console.log('✅ Users seeded');

        // 2. Seed Teams
        const teamsRef = collection(db, 'teams');
        for (const team of TEAMS) {
            await setDoc(doc(teamsRef, team.id), team);
        }
        console.log('✅ Teams seeded');

        // 3. Seed Projects
        const projectsRef = collection(db, 'projects');
        for (const project of PROJECTS) {
            await setDoc(doc(projectsRef, project.id), project);
        }
        console.log('✅ Projects seeded');

        // 4. Seed Tasks
        const tasksRef = collection(db, 'tasks');
        for (const task of TASKS) {
            await setDoc(doc(tasksRef, task.id), task);
        }
        console.log('✅ Tasks seeded');

        // 5. Seed Comments
        const commentsRef = collection(db, 'comments');
        for (const comment of COMMENTS) {
            await setDoc(doc(commentsRef, comment.id), comment);
        }
        console.log('✅ Comments seeded');

        console.log('🎉 Database seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
};
