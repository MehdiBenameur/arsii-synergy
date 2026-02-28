import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
// Mock data removed
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export const TeamWorkloadScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { teams, users, getUserWorkload } = useProjects();

    const myTeam = teams.find(t => t.id === user.teamId);
    const teamMembers = myTeam ? users.filter(u => u.teamId === myTeam.id) : [];

    // Calculate workloads
    const workloads = teamMembers.map(member => {
        const load = getUserWorkload(member.id);
        // Simple logic for MVP: 
        // > 5 tasks = overloaded (danger)
        // 3-5 tasks = moderate (warning)
        // < 3 tasks = good (success)
        let state = 'good';
        let color = colors.success;

        if (load.total > 5) {
            state = 'overloaded';
            color = colors.danger;
        } else if (load.total >= 3) {
            state = 'moderate';
            color = colors.warning;
        }

        return { member, load, state, color };
    }).sort((a, b) => b.load.total - a.load.total);

    // Find max for bar scaling
    const maxTasks = Math.max(...workloads.map(w => w.load.total), 1);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Team Workload</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <Text style={styles.infoText}>
                        Use this view to ensure tasks are distributed fairly across the team. Reassign tasks from overloaded members to those with capacity.
                    </Text>
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                        <Text style={styles.legendText}>Good</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                        <Text style={styles.legendText}>Moderate</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                        <Text style={styles.legendText}>Overloaded</Text>
                    </View>
                </View>

                {workloads.map(({ member, load, color }) => (
                    <View key={member.id} style={styles.memberRow}>
                        <View style={styles.memberInfo}>
                            <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                                <Text style={styles.avatarText}>{member.avatar}</Text>
                            </View>
                            <View>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.taskCount}>{load.total} tasks active</Text>
                            </View>
                        </View>

                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        backgroundColor: color,
                                        width: `${(load.total / maxTasks) * 100}%`,
                                        minWidth: load.total > 0 ? '10%' : '2%'
                                    }
                                ]}
                            />
                            <Text style={styles.barLabel}>{load.total}</Text>
                        </View>

                        <View style={styles.statusBreakdown}>
                            <Text style={styles.breakdownText}>To Do: {load.todo}</Text>
                            <Text style={styles.breakdownText}>In Progress: {load.inprogress}</Text>
                        </View>
                    </View>
                ))}

            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    content: {
        padding: spacing.xl,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.primaryXLight,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.sm,
        color: colors.primaryDark,
        lineHeight: 20,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        gap: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    memberRow: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.surface,
    },
    memberName: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
    },
    taskCount: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.borderLight,
        height: 24,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
    },
    barLabel: {
        position: 'absolute',
        right: 8,
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.textSecondary,
    },
    statusBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    breakdownText: {
        fontSize: typography.xs,
        color: colors.textTertiary,
    },
});
