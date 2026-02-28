import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge, PriorityBadge } from './Badges';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { format } from 'date-fns';
import { isOverdue, isDueSoon } from '../data/mockData';
import { useProjects } from '../context/ProjectContext';

export const TaskCard = ({ task, onPress }) => {
    const { getUserById, getProjectById, getCommentsForTask } = useProjects();

    if (!task) return null;

    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const project = task.projectId ? getProjectById(task.projectId) : null;
    const commentCount = getCommentsForTask(task.id).length;

    const overdue = isOverdue(task.deadline) && task.status !== 'done';
    const dueSoon = isDueSoon(task.deadline) && task.status !== 'done';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.badges}>
                    <StatusBadge status={task.status} />
                    {task.priority && <PriorityBadge priority={task.priority} style={{ marginLeft: spacing.xs }} />}
                </View>
                <Text style={styles.dateText}>
                    {format(new Date(task.createdAt), 'MMM d')}
                </Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {task.title}
            </Text>

            {project && (
                <View style={styles.projectContainer}>
                    <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                    <Text style={styles.projectText}>{project.title}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.leftFooter}>
                    {assignee ? (
                        <View style={styles.assigneeContainer}>
                            <View style={[styles.avatar, { backgroundColor: assignee.avatarColor }]}>
                                <Text style={styles.avatarText}>{assignee.avatar}</Text>
                            </View>
                            <Text style={styles.assigneeName}>{assignee.name.split(' ')[0]}</Text>
                        </View>
                    ) : (
                        <Text style={styles.unassignedText}>Unassigned</Text>
                    )}

                    {commentCount > 0 && (
                        <View style={styles.metricsContainer}>
                            <Ionicons name="chatbubble-outline" size={14} color={colors.textTertiary} />
                            <Text style={styles.metricsText}>{commentCount}</Text>
                        </View>
                    )}
                </View>

                <View style={[
                    styles.deadlineContainer,
                    overdue ? styles.deadlineOverdue : (dueSoon ? styles.deadlineWarning : null)
                ]}>
                    <Ionicons
                        name="time-outline"
                        size={14}
                        color={overdue ? colors.danger : (dueSoon ? colors.warning : colors.textTertiary)}
                    />
                    <Text style={[
                        styles.deadlineText,
                        overdue ? { color: colors.danger } : (dueSoon ? { color: '#B7860D' } : null)
                    ]}>
                        {format(new Date(task.deadline), 'MMM d')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        marginBottom: spacing.base,
        ...shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    badges: {
        flexDirection: 'row',
    },
    title: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
        lineHeight: 22,
    },
    projectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    projectDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    projectText: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    leftFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assigneeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.base,
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    avatarText: {
        color: colors.surface,
        fontSize: 9,
        fontWeight: typography.bold,
    },
    assigneeName: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    unassignedText: {
        fontSize: typography.sm,
        color: colors.textTertiary,
        fontStyle: 'italic',
        marginRight: spacing.base,
    },
    metricsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricsText: {
        fontSize: typography.xs,
        color: colors.textTertiary,
        marginLeft: 4,
    },
    deadlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    deadlineOverdue: {
        backgroundColor: colors.dangerLight,
    },
    deadlineWarning: {
        backgroundColor: colors.warningLight,
    },
    deadlineText: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginLeft: 4,
        fontWeight: typography.medium,
    },
    dateText: {
        fontSize: typography.xs,
        color: colors.textTertiary,
    },
});
