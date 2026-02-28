import { db } from './firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { USERS, TEAMS, PROJECTS, TASKS, COMMENTS } from '../data/mockData';

export const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');

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
