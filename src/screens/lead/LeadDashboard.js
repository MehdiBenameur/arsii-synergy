import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { TaskCard, ProgressBar, SearchBar } from '../../components';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
// Mock data imports removed
import { Ionicons } from '@expo/vector-icons';

export const LeadDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const { teams, getTasksForTeam, getTeamProgress } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const myTeam = teams.find(t => t.id === user.teamId);
    const teamTasks = myTeam ? getTasksForTeam(myTeam.id) : [];
    const teamProgress = myTeam ? getTeamProgress(myTeam.id) : 0;

    const filteredTasks = useMemo(() => {
        return teamTasks
            .filter(task => {
                const matchesSearch =
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [teamTasks, searchQuery, statusFilter]);

    // Quick metrics
    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(t => t.status === 'done').length;

    const overdueTasks = teamTasks.filter(t =>
        new Date(t.deadline) < new Date() && t.status !== 'done'
    );

    const handleCreateTask = () => {
        navigation.navigate('CreateTask');
    };

    const StatusTab = ({ label, count, status, active }) => (
        <TouchableOpacity
            style={[styles.statusTab, active && styles.statusTabActive]}
            onPress={() => setStatusFilter(status)}
        >
            <Text style={[styles.statusTabText, active && styles.statusTabTextActive]}>
                {label} {count !== undefined ? `(${count})` : ''}
            </Text>
        </TouchableOpacity>
    );

    if (!myTeam) return (
        <View style={styles.centerContainer}><Text>No team assigned</Text></View>
    );

    const todoCount = teamTasks.filter(t => t.status === 'todo').length;
    const inProgressCount = teamTasks.filter(t => t.status === 'inprogress').length;
    const doneCount = teamTasks.filter(t => t.status === 'done').length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Team {myTeam.name}</Text>
                <Text style={styles.subtitle}>Lead Dashboard overview</Text>
            </View>

            <View style={styles.searchSection}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search team tasks..."
                />
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <StatusTab label="All" status="all" active={statusFilter === 'all'} />
                    <StatusTab label="To Do" count={todoCount} status="todo" active={statusFilter === 'todo'} />
                    <StatusTab label="In Progress" count={inProgressCount} status="inprogress" active={statusFilter === 'inprogress'} />
                    <StatusTab label="Done" count={doneCount} status="done" active={statusFilter === 'done'} />
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.cardTitle}>Overall Team Progress</Text>
                        <Text style={styles.progressText}>{teamProgress}%</Text>
                    </View>
                    <ProgressBar progress={teamProgress} color={myTeam.color} height={8} />

                    <View style={styles.statsRow}>
                        <View style={styles.statLine}>
                            <Text style={styles.statNumber}>{completedTasks}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statLine}>
                            <Text style={styles.statNumber}>{totalTasks - completedTasks}</Text>
                            <Text style={styles.statLabel}>Remaining</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statLine}>
                            <Text style={[styles.statNumber, { color: overdueTasks.length > 0 ? colors.danger : colors.text }]}>
                                {overdueTasks.length}
                            </Text>
                            <Text style={styles.statLabel}>Overdue</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={handleCreateTask}
                    >
                        <Ionicons name="add" size={20} color={colors.surface} />
                        <Text style={styles.actionBtnText}>New Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('TeamWorkload')}
                    >
                        <Ionicons name="bar-chart-outline" size={20} color={colors.text} />
                        <Text style={[styles.actionBtnText, { color: colors.text }]}>Workload</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.taskList}>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>
                                {searchQuery || statusFilter !== 'all' ? "No matches found" : "No tasks yet"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || statusFilter !== 'all' ? "Try changing your search or filters" : "Your team has no tasks assigned."}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: spacing.xl,
        paddingBottom: spacing.sm,
    },
    greeting: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    progressCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        ...shadows.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
    },
    progressText: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    statLine: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: colors.borderLight,
        height: '100%',
    },
    statNumber: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    actionBtnText: {
        color: colors.surface,
        fontSize: typography.sm,
        fontWeight: typography.bold,
        marginLeft: spacing.xs,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    seeAllText: {
        fontSize: typography.sm,
        color: colors.primary,
        fontWeight: typography.medium,
    },
    searchSection: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    filterSection: {
        marginBottom: spacing.md,
    },
    filterScroll: {
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
    },
    statusTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        height: 36,
        justifyContent: 'center',
    },
    statusTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statusTabText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    statusTabTextActive: {
        color: colors.surface,
        fontWeight: typography.bold,
    },
    taskList: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
