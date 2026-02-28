import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } = useNotifications();

    const notifications = getUserNotifications(user.id);
    const unreadCount = getUnreadCount(user.id);

    const handlePress = (notif) => {
        if (!notif.read) markAsRead(notif.id);
        if (notif.taskId) {
            navigation.navigate('TaskDetail', { taskId: notif.taskId });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'task_assigned': return { name: 'document-text', color: colors.info };
            case 'deadline': return { name: 'time', color: colors.danger };
            case 'task_done': return { name: 'checkmark-circle', color: colors.success };
            default: return { name: 'notifications', color: colors.primary };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={() => markAllAsRead(user.id)}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const icon = getIcon(item.type);

                    return (
                        <TouchableOpacity
                            style={[styles.card, !item.read && styles.unreadCard]}
                            onPress={() => handlePress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                                <Ionicons name={icon.name} size={24} color={icon.color} />
                            </View>

                            <View style={styles.content}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                    </Text>
                                </View>
                                <Text style={styles.messageText}>{item.message}</Text>
                            </View>

                            {!item.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={48} color={colors.border} />
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptyDesc}>When you get assigned tasks or deadlines approach, they'll appear here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: spacing.xl,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
    },
    markAllText: {
        fontSize: typography.sm,
        color: colors.primary,
        fontWeight: typography.medium,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
        alignItems: 'center',
    },
    unreadCard: {
        backgroundColor: colors.surfaceAlt,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    cardTitle: {
        fontSize: typography.base,
        color: colors.text,
        fontWeight: typography.medium,
    },
    unreadText: {
        fontWeight: typography.bold,
    },
    timeText: {
        fontSize: typography.xs,
        color: colors.textTertiary,
    },
    messageText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['5xl'],
    },
    emptyTitle: {
        marginTop: spacing.md,
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    emptyDesc: {
        marginTop: spacing.sm,
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        lineHeight: 20,
    }
});
