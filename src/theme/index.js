// ARSII Synergy App - Design System
// Based on ARSII Sfax branding: teal/turquoise palette

export const colors = {
    // Primary brand colors from ARSII Sfax logo
    primary: '#2D8C8B',
    primaryLight: '#5ECECE',
    primaryDark: '#1A6B6A',
    primaryXLight: '#E8F7F7',

    // Status colors
    success: '#00B894',
    successLight: '#E6F9F5',
    warning: '#FDCB6E',
    warningLight: '#FFF9EC',
    danger: '#E17055',
    dangerLight: '#FDF0ED',
    info: '#74B9FF',
    infoLight: '#EDF5FF',

    // Neutral
    background: '#F0F4F8',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFB',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    // Text
    text: '#1A202C',
    textSecondary: '#4A5568',
    textTertiary: '#718096',
    textOnPrimary: '#FFFFFF',

    // Role accent colors
    roleAdmin: '#6C5CE7',
    roleAdminLight: '#EDE8FE',
    roleManager: '#0984E3',
    roleManagerLight: '#E8F3FE',
    roleLead: '#2D8C8B',
    roleLeadLight: '#E8F7F7',
    roleUser: '#00B894',
    roleUserLight: '#E6F9F5',

    // Task status
    statusTodo: '#718096',
    statusTodoLight: '#EDF2F7',
    statusInProgress: '#FDCB6E',
    statusInProgressLight: '#FFF9EC',
    statusDone: '#00B894',
    statusDoneLight: '#E6F9F5',
};

export const typography = {
    // Font sizes
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 30,
    '4xl': 36,

    // Font weights (React Native uses string values)
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
};

export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    primary: {
        shadowColor: '#2D8C8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'todo': return { bg: colors.statusTodoLight, text: colors.statusTodo, label: 'To Do' };
        case 'inprogress': return { bg: colors.statusInProgressLight, text: '#B7860D', label: 'In Progress' };
        case 'done': return { bg: colors.statusDoneLight, text: colors.statusDone, label: 'Done' };
        default: return { bg: colors.statusTodoLight, text: colors.statusTodo, label: status };
    }
};

export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return { color: colors.danger, label: 'High' };
        case 'medium': return { color: colors.warning, label: 'Medium' };
        case 'low': return { color: colors.success, label: 'Low' };
        default: return { color: colors.textTertiary, label: priority };
    }
};

export const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return { bg: colors.roleAdminLight, text: colors.roleAdmin, label: 'Admin' };
        case 'manager': return { bg: colors.roleManagerLight, text: colors.roleManager, label: 'Manager' };
        case 'lead': return { bg: colors.roleLeadLight, text: colors.roleLead, label: 'Team Lead' };
        case 'user': return { bg: colors.roleUserLight, text: colors.roleUser, label: 'Member' };
        default: return { bg: colors.border, text: colors.textSecondary, label: role };
    }
};
