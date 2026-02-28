import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, getRoleColor, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { seedDatabase } from '../../services/dbSeed';

export const LoginScreen = () => {
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('user'); // admin, manager, lead, user
    const [teamId, setTeamId] = useState('team_alpha'); // team_alpha, team_beta
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email.trim(), password);
            } else {
                if (!name.trim()) {
                    Alert.alert('Error', 'Please enter your name');
                    setIsLoading(false);
                    return;
                }
                const finalTeamId = (role === 'user' || role === 'lead') ? teamId : null;
                await register(email.trim(), password, name.trim(), role, finalTeamId);
            }
        } catch (error) {
            Alert.alert('Authentication Failed', error.message || 'Check your credentials and try again.');
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoPrefix}>ar</Text>
                            <Text style={styles.logoSuffix}>sii</Text>
                        </View>
                        <Text style={styles.appTitle}>Synergy App</Text>
                        <Text style={styles.subtitle}>Stop the Scroll, Start the Control</Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
                        <Text style={styles.sectionDesc}>
                            {isLogin ? 'Sign in to access your dashboard' : 'Sign up to try out the MVP roles'}
                        </Text>

                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="John Doe"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Role</Text>
                                <View style={styles.roleTabs}>
                                    {['user', 'lead', 'manager', 'admin'].map((r) => {
                                        const rColor = getRoleColor(r);
                                        const isSelected = role === r;
                                        return (
                                            <TouchableOpacity
                                                key={r}
                                                style={[
                                                    styles.roleTab,
                                                    isSelected && { backgroundColor: rColor.bg, borderColor: rColor.text }
                                                ]}
                                                onPress={() => setRole(r)}
                                            >
                                                <Text style={[styles.roleTabText, isSelected && { color: rColor.text, fontWeight: 'bold' }]}>
                                                    {r.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {!isLogin && (role === 'user' || role === 'lead') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Team</Text>
                                <View style={styles.roleTabs}>
                                    {[
                                        { id: 'team_alpha', name: 'Team Alpha' },
                                        { id: 'team_beta', name: 'Team Beta' }
                                    ].map((t) => {
                                        const isSelected = teamId === t.id;
                                        return (
                                            <TouchableOpacity
                                                key={t.id}
                                                style={[
                                                    styles.roleTab,
                                                    isSelected && { backgroundColor: colors.primaryXLight, borderColor: colors.primary }
                                                ]}
                                                onPress={() => setTeamId(t.id)}
                                            >
                                                <Text style={[styles.roleTabText, isSelected && { color: colors.primary, fontWeight: 'bold' }]}>
                                                    {t.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.surface} />
                            ) : (
                                <Text style={styles.submitBtnText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.switchModeContainer}>
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                <Text style={styles.switchTextBold}>{isLogin ? 'Register' : 'Login'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>



                    <View style={styles.footer}>
                        <Text style={styles.footerText}>ARSII Sfax Challenge MVP</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
        marginTop: spacing.xl,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    logoPrefix: {
        fontSize: 48,
        fontWeight: typography.extrabold,
        color: colors.primaryLight,
    },
    logoSuffix: {
        fontSize: 48,
        fontWeight: typography.extrabold,
        color: colors.primary,
    },
    appTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    formSection: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.md,
    },
    sectionTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sectionDesc: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.sm,
    },
    inputIcon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: typography.md,
        color: colors.text,
    },
    roleTabs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    roleTab: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.background,
    },
    roleTabText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: colors.surface,
        fontSize: typography.md,
        fontWeight: typography.bold,
    },
    switchModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    switchText: {
        color: colors.textSecondary,
        fontSize: typography.sm,
    },
    switchTextBold: {
        color: colors.primary,
        fontWeight: typography.bold,
        fontSize: typography.sm,
    },
    footer: {
        marginTop: spacing['3xl'],
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.xs,
        color: colors.textTertiary,
    },
});
