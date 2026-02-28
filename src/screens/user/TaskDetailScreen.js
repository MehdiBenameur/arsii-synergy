import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
// mockData removed
import { colors, typography, spacing, borderRadius, shadows, getStatusColor } from '../../theme';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import uuid from 'react-native-uuid'; // Note: In a real app we'd add comments to context, but mutating mock data for demo speed

export const TaskDetailScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { tasks, updateTaskStatus, getProjectById, getUserById, getCommentsForTask, addComment } = useProjects();
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const task = tasks.find(t => t.id === taskId);
    const project = task ? getProjectById(task.projectId) : null;
    const createdBy = task ? getUserById(task.createdBy) : null;

    // Local state for comments (simplified for demo)
    const [newComment, setNewComment] = useState('');
    const comments = getCommentsForTask(taskId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (!task) return null;

    const handleStatusChange = async (newStatus) => {
        if (task.status === newStatus) return;

        await updateTaskStatus(taskId, newStatus);

        // Simulate real-time notification to the creator (Lead/Manager)
        if (newStatus === 'done' && user.id !== task.createdBy) {
            await addNotification({
                userId: task.createdBy,
                type: 'task_done',
                title: 'Task Completed',
                message: `${user.name.split(' ')[0]} marked "${task.title}" as Done.`,
                taskId: task.id
            });
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const commentText = newComment.trim();
        setNewComment(''); // Clear early for better UX

        await addComment({
            taskId,
            userId: user.id,
            text: commentText
        });

        // Notify the other party
        // If I am the assignee, notify the creator
        // If I am the creator, notify the assignee
        const notifyWhom = user.id === task.assigneeId ? task.createdBy : task.assigneeId;

        if (notifyWhom && notifyWhom !== user.id) {
            await addNotification({
                userId: notifyWhom,
                type: 'comment',
                title: 'New Comment',
                message: `${user.name.split(' ')[0]} commented on "${task.title}"`,
                taskId: task.id
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.badges}>
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} style={{ marginLeft: spacing.sm }} />
                        </View>
                        <Text style={styles.deadlineTitle}>
                            Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                        </Text>
                    </View>

                    <Text style={styles.title}>{task.title}</Text>

                    {project && (
                        <View style={styles.projectStrip}>
                            <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                            <Text style={styles.projectText}>{project.title}</Text>
                        </View>
                    )}

                    <Text style={styles.description}>{task.description}</Text>

                    <View style={styles.metaSection}>
                        <Text style={styles.sectionTitle}>Assigned by</Text>
                        <View style={styles.userRow}>
                            <View style={[styles.avatar, { backgroundColor: createdBy?.avatarColor || colors.border }]}>
                                <Text style={styles.avatarText}>{createdBy?.avatar || '?'}</Text>
                            </View>
                            <Text style={styles.userName}>{createdBy?.name || 'Unknown'}</Text>
                        </View>
                    </View>

                    <View style={styles.statusSection}>
                        <Text style={styles.sectionTitle}>Update Status</Text>
                        <View style={styles.statusButtons}>
                            {['todo', 'inprogress', 'done'].map((status) => {
                                const isActive = task.status === status;
                                const statusStyle = getStatusColor(status);

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.statusSelectBtn,
                                            isActive && { backgroundColor: statusStyle.bg, borderColor: statusStyle.text }
                                        ]}
                                        onPress={() => handleStatusChange(status)}
                                    >
                                        <Text style={[
                                            styles.statusSelectText,
                                            isActive ? { color: statusStyle.text, fontWeight: typography.bold } : {}
                                        ]}>
                                            {statusStyle.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.commentsSection}>
                        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

                        {comments.map(comment => {
                            const commentUser = getUserById(comment.userId);
                            const isMe = comment.userId === user.id;

                            return (
                                <View key={comment.id} style={[styles.commentCard, isMe && styles.myCommentCard]}>
                                    {!isMe && (
                                        <View style={[styles.avatarSmall, { backgroundColor: commentUser?.avatarColor }]}>
                                            <Text style={styles.avatarTextSmall}>{commentUser?.avatar}</Text>
                                        </View>
                                    )}
                                    <View style={[styles.commentBubble, isMe ? styles.myCommentBubble : styles.otherCommentBubble]}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentName}>{isMe ? 'You' : commentUser?.name}</Text>
                                            <Text style={styles.commentTime}>{format(new Date(comment.createdAt), 'MMM d, HH:mm')}</Text>
                                        </View>
                                        <Text style={[styles.commentText, isMe && { color: colors.surface }]}>{comment.text}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment or report a blocker..."
                        placeholderTextColor={colors.textTertiary}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        <Ionicons name="send" size={18} color={colors.surface} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    backButton: {
        marginBottom: spacing.md,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badges: {
        flexDirection: 'row',
    },
    deadlineTitle: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
        lineHeight: 32,
    },
    projectStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    projectDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.sm,
    },
    projectText: {
        fontSize: typography.base,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    description: {
        fontSize: typography.base,
        color: colors.text,
        lineHeight: 24,
        marginBottom: spacing.xl,
    },
    metaSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    avatarText: {
        color: colors.surface,
        fontSize: typography.sm,
        fontWeight: typography.bold,
    },
    userName: {
        fontSize: typography.md,
        color: colors.text,
    },
    statusSection: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    statusButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusSelectBtn: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statusSelectText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.lg,
    },
    commentsSection: {
        marginTop: spacing.sm,
    },
    commentCard: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        maxWidth: '90%',
    },
    myCommentCard: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    avatarTextSmall: {
        color: colors.surface,
        fontSize: 10,
        fontWeight: typography.bold,
    },
    commentBubble: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flex: 1,
    },
    otherCommentBubble: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 0,
        ...shadows.sm,
    },
    myCommentBubble: {
        backgroundColor: colors.primary,
        borderTopRightRadius: 0,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    commentName: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textSecondary,
    },
    commentTime: {
        fontSize: 10,
        color: colors.textTertiary,
    },
    commentText: {
        fontSize: typography.sm,
        color: colors.text,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 44,
        maxHeight: 120,
        fontSize: typography.md,
        color: colors.text,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: colors.border,
    },
});
