import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LogoutModal } from '../../components';
import { colors, typography, spacing, borderRadius, getRoleColor } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [logoutVisible, setLogoutVisible] = useState(false);
    const roleStyle = getRoleColor(user.role);

    const handleLogout = () => {
        setLogoutVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: user.avatarColor || colors.primary }]}>
                        <Text style={styles.avatarText}>{user.avatar}</Text>
                    </View>
                    <View style={styles.nameSection}>
                        <Text style={styles.name}>{user.name}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
                            <Text style={[styles.roleText, { color: roleStyle.text }]}>{roleStyle.label}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{user.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.infoText}>Joined {user.joinedAt ? format(new Date(user.joinedAt), 'MMMM yyyy') : 'Recently'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionSection}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="settings-outline" size={22} color={colors.text} />
                    <Text style={styles.actionText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.actionIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="help-circle-outline" size={22} color={colors.text} />
                    <Text style={styles.actionText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.actionIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.danger} />
                    <Text style={[styles.actionText, { color: colors.danger }]}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>ARSII Synergy MVP v1.0.0</Text>
            </View>

            <LogoutModal
                visible={logoutVisible}
                onConfirm={logout}
                onCancel={() => setLogoutVisible(false)}
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
        padding: spacing.xl,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
    },
    profileCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    avatarText: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.surface,
    },
    nameSection: {
        flex: 1,
    },
    name: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    roleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
    },
    infoSection: {
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: typography.md,
        color: colors.textSecondary,
        marginLeft: spacing.md,
    },
    actionSection: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    actionText: {
        flex: 1,
        fontSize: typography.md,
        color: colors.text,
        marginLeft: spacing.md,
        fontWeight: typography.medium,
    },
    actionIcon: {
        marginLeft: 'auto',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    versionText: {
        fontSize: typography.sm,
        color: colors.textTertiary,
    },
});
