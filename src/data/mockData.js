// ARSII Synergy App - Mock Data
// Rich seed data for demo purposes

import { format, addDays, subDays } from 'date-fns';

const today = new Date();
const fmt = (d) => d.toISOString();

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────
export const USERS = [
    {
        id: 'u_admin',
        name: 'Sami Mansouri',
        email: 'sami.admin@arsii-sfax.tn',
        role: 'admin',
        teamId: null,
        avatar: 'SM',
        avatarColor: '#6C5CE7',
        joinedAt: fmt(subDays(today, 180)),
    },
    {
        id: 'u_manager',
        name: 'Leila Ben Ali',
        email: 'leila.manager@arsii-sfax.tn',
        role: 'manager',
        teamId: null,
        avatar: 'LB',
        avatarColor: '#0984E3',
        joinedAt: fmt(subDays(today, 150)),
    },
    {
        id: 'u_lead1',
        name: 'Youssef Cherni',
        email: 'youssef.lead@arsii-sfax.tn',
        role: 'lead',
        teamId: 'team_alpha',
        avatar: 'YC',
        avatarColor: '#2D8C8B',
        joinedAt: fmt(subDays(today, 120)),
    },
    {
        id: 'u_lead2',
        name: 'Mariem Trabelsi',
        email: 'mariem.lead@arsii-sfax.tn',
        role: 'lead',
        teamId: 'team_beta',
        avatar: 'MT',
        avatarColor: '#2D8C8B',
        joinedAt: fmt(subDays(today, 90)),
    },
    {
        id: 'u_user1',
        name: 'Ahmed Belhaj',
        email: 'ahmed@arsii-sfax.tn',
        role: 'user',
        teamId: 'team_alpha',
        avatar: 'AB',
        avatarColor: '#00B894',
        joinedAt: fmt(subDays(today, 60)),
    },
    {
        id: 'u_user2',
        name: 'Nour Gharbi',
        email: 'nour@arsii-sfax.tn',
        role: 'user',
        teamId: 'team_alpha',
        avatar: 'NG',
        avatarColor: '#00B894',
        joinedAt: fmt(subDays(today, 45)),
    },
    {
        id: 'u_user3',
        name: 'Rim Jlassi',
        email: 'rim@arsii-sfax.tn',
        role: 'user',
        teamId: 'team_beta',
        avatar: 'RJ',
        avatarColor: '#00B894',
        joinedAt: fmt(subDays(today, 30)),
    },
    {
        id: 'u_user4',
        name: 'Khalil Souissi',
        email: 'khalil@arsii-sfax.tn',
        role: 'user',
        teamId: 'team_beta',
        avatar: 'KS',
        avatarColor: '#00B894',
        joinedAt: fmt(subDays(today, 20)),
    },
];

// ─────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────
export const TEAMS = [
    {
        id: 'team_alpha',
        name: 'Team Alpha',
        description: 'Frontend & Mobile Development',
        leadId: 'u_lead1',
        memberIds: ['u_user1', 'u_user2'],
        color: '#2D8C8B',
    },
    {
        id: 'team_beta',
        name: 'Team Beta',
        description: 'Backend & Infrastructure',
        leadId: 'u_lead2',
        memberIds: ['u_user3', 'u_user4'],
        color: '#0984E3',
    },
];

// ─────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────
export const PROJECTS = [
    {
        id: 'proj_1',
        title: 'ARSII Mobile App',
        description: 'Design and develop the ARSII-Sfax centralized management mobile application.',
        managerId: 'u_manager',
        teamIds: ['team_alpha', 'team_beta'],
        startDate: fmt(subDays(today, 30)),
        endDate: fmt(addDays(today, 30)),
        status: 'active',
        color: '#2D8C8B',
    },
    {
        id: 'proj_2',
        title: 'Website Redesign',
        description: 'Modernize the ARSII-Sfax official website with a fresh look and improved performance.',
        managerId: 'u_manager',
        teamIds: ['team_alpha'],
        startDate: fmt(subDays(today, 15)),
        endDate: fmt(addDays(today, 45)),
        status: 'active',
        color: '#0984E3',
    },
    {
        id: 'proj_3',
        title: 'AI Workshop Series',
        description: 'Organize and deliver a series of AI workshops for ARSII members.',
        managerId: 'u_manager',
        teamIds: ['team_beta'],
        startDate: fmt(subDays(today, 7)),
        endDate: fmt(addDays(today, 60)),
        status: 'active',
        color: '#6C5CE7',
    },
];

// ─────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────
export const TASKS = [
    // Project 1 tasks
    {
        id: 'task_1',
        title: 'Design Login Screen UI',
        description: 'Create high-fidelity mockups for the login screen following ARSII brand guidelines.',
        projectId: 'proj_1',
        assigneeId: 'u_user1',
        createdBy: 'u_lead1',
        status: 'done',
        priority: 'high',
        deadline: fmt(subDays(today, 5)),
        createdAt: fmt(subDays(today, 15)),
        updatedAt: fmt(subDays(today, 3)),
    },
    {
        id: 'task_2',
        title: 'Implement Navigation Flow',
        description: 'Set up React Navigation with role-based routing for all 4 user roles.',
        projectId: 'proj_1',
        assigneeId: 'u_user1',
        createdBy: 'u_lead1',
        status: 'inprogress',
        priority: 'high',
        deadline: fmt(addDays(today, 2)),
        createdAt: fmt(subDays(today, 10)),
        updatedAt: fmt(subDays(today, 1)),
    },
    {
        id: 'task_3',
        title: 'Build Dashboard Components',
        description: 'Create reusable dashboard components: progress bars, stat cards, and task cards.',
        projectId: 'proj_1',
        assigneeId: 'u_user2',
        createdBy: 'u_lead1',
        status: 'inprogress',
        priority: 'high',
        deadline: fmt(addDays(today, 3)),
        createdAt: fmt(subDays(today, 8)),
        updatedAt: fmt(subDays(today, 1)),
    },
    {
        id: 'task_4',
        title: 'Setup Firebase Integration',
        description: 'Configure Firebase Firestore for real-time data sync and Firebase Auth for login.',
        projectId: 'proj_1',
        assigneeId: 'u_user3',
        createdBy: 'u_lead2',
        status: 'done',
        priority: 'high',
        deadline: fmt(subDays(today, 2)),
        createdAt: fmt(subDays(today, 12)),
        updatedAt: fmt(subDays(today, 2)),
    },
    {
        id: 'task_5',
        title: 'REST API Design',
        description: 'Design and document the API endpoints for tasks, users, and projects.',
        projectId: 'proj_1',
        assigneeId: 'u_user4',
        createdBy: 'u_lead2',
        status: 'todo',
        priority: 'medium',
        deadline: fmt(addDays(today, 7)),
        createdAt: fmt(subDays(today, 5)),
        updatedAt: fmt(subDays(today, 5)),
    },
    // Project 2 tasks
    {
        id: 'task_6',
        title: 'Homepage Redesign',
        description: 'Redesign the ARSII-Sfax homepage with modern layout and improved hero section.',
        projectId: 'proj_2',
        assigneeId: 'u_user1',
        createdBy: 'u_lead1',
        status: 'inprogress',
        priority: 'medium',
        deadline: fmt(addDays(today, 10)),
        createdAt: fmt(subDays(today, 10)),
        updatedAt: fmt(today),
    },
    {
        id: 'task_7',
        title: 'Content Audit & Update',
        description: 'Review all existing website content and update outdated information.',
        projectId: 'proj_2',
        assigneeId: 'u_user2',
        createdBy: 'u_lead1',
        status: 'todo',
        priority: 'low',
        deadline: fmt(addDays(today, 20)),
        createdAt: fmt(subDays(today, 8)),
        updatedAt: fmt(subDays(today, 8)),
    },
    // Project 3 tasks
    {
        id: 'task_8',
        title: 'Workshop Content Creation',
        description: 'Prepare slides and hands-on exercises for the intro to ML workshop.',
        projectId: 'proj_3',
        assigneeId: 'u_user3',
        createdBy: 'u_lead2',
        status: 'inprogress',
        priority: 'high',
        deadline: fmt(addDays(today, 5)),
        createdAt: fmt(subDays(today, 7)),
        updatedAt: fmt(subDays(today, 1)),
    },
    {
        id: 'task_9',
        title: 'Setup Workshop Environment',
        description: 'Configure Colab notebooks and test environment for all workshop attendees.',
        projectId: 'proj_3',
        assigneeId: 'u_user4',
        createdBy: 'u_lead2',
        status: 'todo',
        priority: 'medium',
        deadline: fmt(addDays(today, 4)),
        createdAt: fmt(subDays(today, 5)),
        updatedAt: fmt(subDays(today, 5)),
    },
    {
        id: 'task_10',
        title: 'Promote Workshop on Social Media',
        description: 'Create and schedule posts across ARSII social channels to promote the AI workshop.',
        projectId: 'proj_3',
        assigneeId: 'u_user3',
        createdBy: 'u_lead2',
        status: 'todo',
        priority: 'low',
        deadline: fmt(addDays(today, 1)),
        createdAt: fmt(subDays(today, 3)),
        updatedAt: fmt(subDays(today, 3)),
    },
];

// ─────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────
export const COMMENTS = [
    {
        id: 'cmt_1',
        taskId: 'task_2',
        userId: 'u_user1',
        text: "I've started the implementation. Using React Navigation v6 with stack navigators per role.",
        createdAt: fmt(subDays(today, 1)),
    },
    {
        id: 'cmt_2',
        taskId: 'task_2',
        userId: 'u_lead1',
        text: "Great! Make sure the tab bar is hidden on the Login screen. Let me know if you need any clarifications.",
        createdAt: fmt(subDays(today, 1)),
    },
    {
        id: 'cmt_3',
        taskId: 'task_3',
        userId: 'u_user2',
        text: "Facing an issue with the progress bar animation on Android. Looking into it.",
        createdAt: fmt(today),
    },
    {
        id: 'cmt_4',
        taskId: 'task_8',
        userId: 'u_user3',
        text: "Slides are 60% done. Blocked on finding good real-world datasets for the exercises.",
        createdAt: fmt(subDays(today, 1)),
    },
    {
        id: 'cmt_5',
        taskId: 'task_8',
        userId: 'u_lead2',
        text: "Check the Kaggle datasets we used last year. I'll send you the link on Slack.",
        createdAt: fmt(today),
    },
];

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────
export const NOTIFICATIONS = [
    {
        id: 'notif_1',
        userId: 'u_user1',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned "Implement Navigation Flow".',
        read: false,
        taskId: 'task_2',
        createdAt: fmt(subDays(today, 10)),
    },
    {
        id: 'notif_2',
        userId: 'u_user1',
        type: 'deadline',
        title: 'Deadline Approaching',
        message: '"Implement Navigation Flow" is due in 2 days.',
        read: false,
        taskId: 'task_2',
        createdAt: fmt(today),
    },
    {
        id: 'notif_3',
        userId: 'u_user2',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned "Build Dashboard Components".',
        read: true,
        taskId: 'task_3',
        createdAt: fmt(subDays(today, 8)),
    },
    {
        id: 'notif_4',
        userId: 'u_user3',
        type: 'deadline',
        title: 'Deadline Approaching',
        message: '"Promote Workshop on Social Media" is due tomorrow.',
        read: false,
        taskId: 'task_10',
        createdAt: fmt(today),
    },
    {
        id: 'notif_5',
        userId: 'u_lead1',
        type: 'task_done',
        title: 'Task Completed',
        message: 'Ahmed marked "Design Login Screen UI" as Done.',
        read: false,
        taskId: 'task_1',
        createdAt: fmt(subDays(today, 3)),
    },
    {
        id: 'notif_6',
        userId: 'u_user4',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned "REST API Design".',
        read: false,
        taskId: 'task_5',
        createdAt: fmt(subDays(today, 5)),
    },
];

// ─────────────────────────────────────────
// DEMO LOGIN ACCOUNTS (for quick role switching)
// ─────────────────────────────────────────
export const DEMO_ACCOUNTS = [
    {
        userId: 'u_admin',
        label: 'Admin',
        name: 'Sami Mansouri',
        description: 'Full system access & team management',
        icon: 'shield-checkmark',
        color: '#6C5CE7',
        bgColor: '#EDE8FE',
    },
    {
        userId: 'u_manager',
        label: 'Manager',
        name: 'Leila Ben Ali',
        description: 'Project creation, analytics & oversight',
        icon: 'analytics',
        color: '#0984E3',
        bgColor: '#E8F3FE',
    },
    {
        userId: 'u_lead1',
        label: 'Team Lead',
        name: 'Youssef Cherni',
        description: 'Team management & task assignment',
        icon: 'people',
        color: '#2D8C8B',
        bgColor: '#E8F7F7',
    },
    {
        userId: 'u_user1',
        label: 'Member',
        name: 'Ahmed Belhaj',
        description: 'Personal tasks & deadlines',
        icon: 'person',
        color: '#00B894',
        bgColor: '#E6F9F5',
    },
];

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
export const getUserById = (id) => USERS.find(u => u.id === id);
export const getTeamById = (id) => TEAMS.find(t => t.id === id);
export const getProjectById = (id) => PROJECTS.find(p => p.id === id);
export const getTaskById = (id) => TASKS.find(t => t.id === id);

export const getTasksForUser = (userId) => TASKS.filter(t => t.assigneeId === userId);
export const getTasksForProject = (projectId) => TASKS.filter(t => t.projectId === projectId);
export const getTasksForTeam = (teamId) => {
    const team = getTeamById(teamId);
    if (!team) return [];
    const memberIds = [team.leadId, ...team.memberIds];
    return TASKS.filter(t => memberIds.includes(t.assigneeId));
};

export const getCommentsForTask = (taskId) => COMMENTS.filter(c => c.taskId === taskId);
export const getNotificationsForUser = (userId) => NOTIFICATIONS.filter(n => n.userId === userId);

export const getProjectProgress = (projectId) => {
    const tasks = getTasksForProject(projectId);
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
};

export const getTeamProgress = (teamId) => {
    const tasks = getTasksForTeam(teamId);
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
};

export const getUserWorkload = (userId) => {
    const tasks = getTasksForUser(userId);
    return {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length,
    };
};

export const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
};

export const isDueSoon = (deadline, days = 3) => {
    const d = new Date(deadline);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
};
