import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { ProgressBar, SearchBar } from '../../components';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
// Mock data removed
import { format } from 'date-fns';

export const ManagerDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const { projects, tasks, getTasksForProject, getProjectProgress } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');

    // For this MVP, we show all active projects to any Manager so the dashboard isn't empty.
    const myProjects = projects;

    const filteredProjects = useMemo(() => {
        return myProjects.filter(project =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [myProjects, searchQuery]);

    // Dashboard Metrics
    const totalProjects = myProjects.length;
    const activeProjects = myProjects.filter(p => p.status === 'active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Manager Overview</Text>
                <Text style={styles.subtitle}>Track high-level project progress</Text>
            </View>

            <View style={styles.searchSection}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search projects..."
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Ionicons name="folder-outline" size={24} color={colors.primary} />
                        <Text style={styles.metricValue}>{activeProjects}/{totalProjects}</Text>
                        <Text style={styles.metricLabel}>Active Projects</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Ionicons name="checkmark-done-outline" size={24} color={colors.success} />
                        <Text style={styles.metricValue}>{completedTasks}/{totalTasks}</Text>
                        <Text style={styles.metricLabel}>Tasks Completed</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Project Portfolio</Text>
                </View>

                {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => {
                        const progress = getProjectProgress(project.id);
                        const projTasks = getTasksForProject(project.id);
                        const OverdueCount = projTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'done').length;

                        return (
                            <TouchableOpacity
                                key={project.id}
                                style={styles.projectCard}
                                activeOpacity={0.8}
                                onPress={() => { }} // Could navigate to project detail
                            >
                                <View style={styles.projectHeader}>
                                    <View style={styles.titleRow}>
                                        <View style={[styles.projectIcon, { backgroundColor: project.color + '20' }]}>
                                            <Ionicons name="briefcase" size={20} color={project.color} />
                                        </View>
                                        <Text style={styles.projectTitle}>{project.title}</Text>
                                    </View>
                                    <Text style={styles.progressText}>{progress}%</Text>
                                </View>

                                <ProgressBar progress={progress} color={project.color} style={{ marginBottom: spacing.md }} />

                                <Text style={styles.projectDesc} numberOfLines={2}>{project.description}</Text>

                                <View style={styles.projectFooter}>
                                    <View style={styles.teamsRow}>
                                        {project.teamIds.map((teamId, index) => (
                                            <View key={teamId} style={[styles.teamBadge, { marginLeft: index > 0 ? -10 : 0 }]}>
                                                <Text style={styles.teamBadgeText}>{teamId === 'team_alpha' ? 'A' : 'B'}</Text>
                                            </View>
                                        ))}
                                        <Text style={styles.footerText}>{projTasks.length} tasks</Text>
                                    </View>

                                    {OverdueCount > 0 ? (
                                        <View style={styles.alertBadge}>
                                            <Ionicons name="warning" size={12} color={colors.danger} />
                                            <Text style={styles.alertText}>{OverdueCount} overdue</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.dateText}>Due {format(new Date(project.endDate), 'MMM d')}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No projects found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your search query</Text>
                    </View>
                )}
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
    searchSection: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    metricsGrid: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    metricCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.sm,
    },
    metricValue: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
        marginVertical: spacing.xs,
    },
    metricLabel: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    sectionHeader: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    projectCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.sm,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    projectIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    projectTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        flex: 1,
    },
    progressText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    projectDesc: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    projectFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
    },
    teamBadgeText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.surface,
    },
    footerText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    dateText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.dangerLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    alertText: {
        fontSize: typography.xs,
        color: colors.danger,
        fontWeight: typography.bold,
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['4xl'],
    },
    emptyTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
        textAlign: 'center',
    }
});
