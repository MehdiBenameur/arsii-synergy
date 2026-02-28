import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { colors, typography, spacing, borderRadius, shadows, getRoleColor } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
// Mock data removed

export const AdminDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const { teams, users, projects, getUserById } = useProjects();

    const activeProjects = projects.filter(p => p.status === 'active').length;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Admin Console</Text>
                    <Text style={styles.subtitle}>System overview and organization</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Users</Text>
                        <Text style={styles.statValue}>{users.length}</Text>
                        <View style={styles.iconBg}>
                            <Ionicons name="people" size={20} color={colors.primary} />
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Active Teams</Text>
                        <Text style={styles.statValue}>{teams.length}</Text>
                        <View style={styles.iconBg}>
                            <Ionicons name="git-network" size={20} color={colors.info} />
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Projects</Text>
                        <Text style={styles.statValue}>{activeProjects}</Text>
                        <View style={styles.iconBg}>
                            <Ionicons name="folder" size={20} color={colors.success} />
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Organization Hierarchy</Text>
                </View>

                {teams.map(team => {
                    const teamUsers = users.filter(u => u.teamId === team.id);
                    const lead = teamUsers.find(u => u.role === 'lead' || u.id === team.leadId) || getUserById(team.leadId);
                    const members = teamUsers.filter(u => u.id !== lead?.id);

                    return (
                        <View key={team.id} style={styles.teamCard}>
                            <View style={[styles.teamHeader, { borderLeftColor: team.color }]}>
                                <View>
                                    <Text style={styles.teamName}>{team.name}</Text>
                                    <Text style={styles.teamDesc}>{team.description}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: team.color + '20' }]}>
                                    <Text style={[styles.badgeText, { color: team.color }]}>
                                        {members.length + 1} Members
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.hierarchyLine} />

                            <View style={styles.membersList}>
                                {/* Team Lead */}
                                {lead && (
                                    <View style={styles.memberRow}>
                                        <View style={[styles.avatar, { backgroundColor: lead.avatarColor }]}>
                                            <Text style={styles.avatarText}>{lead.avatar}</Text>
                                        </View>
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{lead.name}</Text>
                                            <View style={[styles.roleLabel, { backgroundColor: getRoleColor('lead').bg }]}>
                                                <Text style={[styles.roleText, { color: getRoleColor('lead').text }]}>Team Lead</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="star" size={16} color={colors.warning} />
                                    </View>
                                )}

                                {/* Team Members */}
                                {members.map(member => (
                                    <View key={member.id} style={styles.memberRow}>
                                        <View style={styles.indentLine} />
                                        <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                                            <Text style={styles.avatarText}>{member.avatar}</Text>
                                        </View>
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{member.name}</Text>
                                            <View style={[styles.roleLabel, { backgroundColor: getRoleColor('user').bg }]}>
                                                <Text style={[styles.roleText, { color: getRoleColor('user').text }]}>Member</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
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
        paddingBottom: spacing.lg,
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
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: typography.medium,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.text,
    },
    iconBg: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        opacity: 0.1,
        transform: [{ scale: 4 }],
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
    teamCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        ...shadows.sm,
    },
    teamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        paddingLeft: spacing.md,
        marginBottom: spacing.md,
    },
    teamName: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: 2,
    },
    teamDesc: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
    },
    hierarchyLine: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: spacing.md,
    },
    membersList: {
        gap: spacing.md,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    indentLine: {
        width: 20,
        height: 1,
        backgroundColor: colors.borderLight,
        position: 'absolute',
        left: -20,
        top: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.surface,
    },
    memberInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: spacing.md,
    },
    memberName: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.text,
    },
    roleLabel: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    roleText: {
        fontSize: 10,
        fontWeight: typography.bold,
    },
});
