import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { useArtifacts } from '../../context/ArtifactContext';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { format } from 'date-fns';

export const ArtifactViewerScreen = ({ route, navigation }) => {
    const { projectId, type } = route.params; // type: 'main' (Project Brief) or 'tasklist'
    const { getMasterArtifact, subscribeToProjectArtifacts, isGenerating, regenerateTaskList } = useArtifacts();
    const { user } = useAuth();

    // Subscribe to this project's artifacts
    useEffect(() => {
        subscribeToProjectArtifacts(projectId);
    }, [projectId]);

    const artifact = getMasterArtifact(projectId, type);
    const title = type === 'main' ? 'Project Brief' : 'Task List';
    const isLeadOrManager = user.role === 'lead' || user.role === 'manager';

    const handleRegenerate = async () => {
        Alert.alert(
            "Regenerate Task List",
            "This will overwrite the current master Task List using the latest project data and AI. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Regenerate", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await regenerateTaskList(projectId);
                            Alert.alert('Success', 'Task List regenerated successfully!');
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                
                {/* Top-right action button for TaskList Regeneration */}
                {type === 'tasklist' && isLeadOrManager ? (
                    <TouchableOpacity onPress={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <ActivityIndicator color={colors.primary} size="small" />
                        ) : (
                            <Ionicons name="refresh" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} /> // Placeholder for alignment
                )}
            </View>

            {/* Metadata Bar */}
            {artifact && (
                <View style={styles.metaBar}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>
                        Last updated: {format(new Date(artifact.updatedAt), 'MMM d, h:mm a')}
                    </Text>
                </View>
            )}

            {/* Content Area */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {artifact && artifact.content ? (
                    <Markdown style={markdownStyles}>
                        {artifact.content}
                    </Markdown>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.border} />
                        <Text style={styles.emptyTitle}>No {title} Found</Text>
                        <Text style={styles.emptyDesc}>
                            This project doesn't have a published {title} yet.
                            {isLeadOrManager ? ' Use the AI Assistant to generate one.' : ' Ask your Team Lead to publish one.'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button for Editing/Chatting (Available to everyone for their personal draft) */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('ArtifactChat', { projectId, type })}
                activeOpacity={0.8}
            >
                <Ionicons name="sparkles" size={20} color={colors.surface} />
                <Text style={styles.fabText}>AI Assistant</Text>
            </TouchableOpacity>

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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    backBtn: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    metaBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    metaText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingBottom: 100, // Space for FAB
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    emptyDesc: {
        fontSize: typography.md,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: colors.surface,
        fontWeight: typography.bold,
        fontSize: typography.md,
        marginLeft: spacing.sm,
    }
});

// Markdown styling hooks into the ARSII theme
const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
    },
    heading1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    heading3: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 12,
        marginBottom: 6,
    },
    paragraph: {
        marginBottom: 12,
    },
    list_item: {
        marginBottom: 4,
    },
    bullet_list: {
        marginBottom: 12,
    },
    code_block: {
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginBottom: 12,
    },
    code_inline: {
        backgroundColor: colors.background,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: 'monospace',
        color: colors.primary,
    },
    link: {
        color: colors.primary,
        textDecorationLine: 'none',
    }
});
