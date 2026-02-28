import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
// Mock data removed
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format } from 'date-fns';

export const CreateTaskScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { teams, users, addTask, getUserById, getProjectById } = useProjects();
    const { addNotification } = useNotifications();

    // For MVP, we limit to the Lead's team projects
    const myTeam = teams.find(t => t.id === user.teamId);
    const teamMembers = myTeam ? users.filter(u => u.teamId === myTeam.id) : [];

    // Static project for demo (in full app, Lead would select from dropdown)
    const defaultProjectId = 'proj_1';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id || null);
    const [priority, setPriority] = useState('medium');
    const [daysToDeadline, setDaysToDeadline] = useState('7');

    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !description.trim() || !assigneeId) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setIsCreating(true);
        try {
            const deadline = format(addDays(new Date(), parseInt(daysToDeadline) || 7), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

            const newTask = await addTask({
                title: title.trim(),
                description: description.trim(),
                projectId: defaultProjectId,
                assigneeId,
                createdBy: user.id,
                priority,
                deadline,
            });

            // Send notification to assignee
            await addNotification({
                userId: assigneeId,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned "${title.trim()}" by your Lead.`,
                taskId: newTask.id
            });

            // Fluid navigation: Go back immediately
            navigation.goBack();
        } catch (error) {
            console.error(error);
            setIsCreating(false);
            Alert.alert('Error', 'Failed to create task. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="close" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Task</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Task Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Design Homepage UI"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detailed explanation of the task..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Assign To (Team Member) *</Text>
                        <View style={styles.memberGrid}>
                            {teamMembers.map(member => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[
                                        styles.memberCard,
                                        assigneeId === member.id && styles.memberCardSelected
                                    ]}
                                    onPress={() => setAssigneeId(member.id)}
                                >
                                    <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                                        <Text style={styles.avatarText}>{member.avatar}</Text>
                                    </View>
                                    <Text style={[styles.memberName, assigneeId === member.id && styles.memberNameSelected]}>
                                        {member.name.split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.prioritySelector}>
                                {['low', 'medium', 'high'].map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityBtn,
                                            priority === p && styles.priorityBtnSelected
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={[
                                            styles.priorityText,
                                            priority === p && styles.priorityTextSelected
                                        ]}>
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.sm }]}>
                            <Text style={styles.label}>Deadline (Days)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={daysToDeadline}
                                onChangeText={setDaysToDeadline}
                                maxLength={2}
                            />
                        </View>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.createBtn, isCreating && { opacity: 0.7 }]}
                        onPress={handleCreate}
                        disabled={isCreating}
                    >
                        <Text style={styles.createBtnText}>
                            {isCreating ? 'Creating...' : 'Create Task'}
                        </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    content: {
        padding: spacing.xl,
    },
    formGroup: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.md,
        color: colors.text,
        minHeight: 48,
    },
    textArea: {
        minHeight: 120,
        paddingTop: spacing.md,
    },
    memberGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
    },
    memberCardSelected: {
        backgroundColor: colors.primaryXLight,
        borderColor: colors.primary,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    avatarText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.surface,
    },
    memberName: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginRight: spacing.xs,
    },
    memberNameSelected: {
        color: colors.primary,
        fontWeight: typography.bold,
    },
    row: {
        flexDirection: 'row',
    },
    prioritySelector: {
        flexDirection: 'column',
        gap: spacing.xs,
    },
    priorityBtn: {
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surface,
    },
    priorityBtnSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    priorityText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    priorityTextSelected: {
        color: colors.surface,
        fontWeight: typography.bold,
    },
    footer: {
        padding: spacing.xl,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        ...shadows.lg,
    },
    createBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: 16,
        alignItems: 'center',
    },
    createBtnText: {
        color: colors.surface,
        fontSize: typography.md,
        fontWeight: typography.bold,
    },
});
