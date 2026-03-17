import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { useArtifacts } from '../../context/ArtifactContext';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const DiffViewScreen = ({ route, navigation }) => {
    const { projectId, type } = route.params;
    const { getMasterArtifact, getUserDraft, publishDraft } = useArtifacts();

    const [isPublishing, setIsPublishing] = useState(false);

    const masterArtifact = getMasterArtifact(projectId, type);
    const userDraft = getUserDraft(projectId, type);

    const masterContent = masterArtifact ? masterArtifact.content : '*No master document exists yet.*';
    const draftContent = userDraft && userDraft.content ? userDraft.content : '*Your draft is completely empty.*';

    const handlePublish = async () => {
        if (!userDraft || !userDraft.content) {
            Alert.alert('Empty Draft', 'You cannot publish an empty draft.');
            return;
        }

        setIsPublishing(true);
        try {
            await publishDraft(projectId, type, userDraft.content);
            Alert.alert('Success', 'Document published successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Go back to the viewer screen, popping the Chat and Diff screens
                        navigation.navigate('ArtifactViewer', { projectId, type });
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isPublishing}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Changes</Text>
                <TouchableOpacity onPress={handlePublish} disabled={isPublishing}>
                    {isPublishing ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                        <Text style={styles.publishText}>Confirm</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.contentWrapper}>
                {/* Top Half: User Draft */}
                <View style={styles.panel}>
                    <View style={[styles.panelHeader, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                        <Text style={[styles.panelTitle, { color: colors.primary }]}>Your Draft</Text>
                    </View>
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <Markdown style={markdownStyles}>{draftContent}</Markdown>
                    </ScrollView>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                    <Ionicons name="swap-vertical" size={20} color={colors.border} />
                </View>

                {/* Bottom Half: Current Master */}
                <View style={styles.panel}>
                    <View style={[styles.panelHeader, { backgroundColor: colors.surface }]}>
                        <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.panelTitle, { color: colors.textSecondary }]}>Current Master</Text>
                    </View>
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <Markdown style={markdownStyles}>{masterContent}</Markdown>
                    </ScrollView>
                </View>
            </View>

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
        paddingVertical: spacing.xs,
    },
    cancelText: {
        fontSize: typography.md,
        color: colors.textSecondary,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text,
    },
    publishText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    contentWrapper: {
        flex: 1,
        flexDirection: 'column',
    },
    divider: {
        height: 24,
        backgroundColor: colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    panel: {
        flex: 1,
        backgroundColor: colors.background,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    panelTitle: {
        fontWeight: typography.bold,
        fontSize: typography.sm,
        marginLeft: spacing.xs,
    },
    scrollView: {
        flex: 1,
        padding: spacing.md,
    }
});

const markdownStyles = StyleSheet.create({
    body: { fontSize: 14, color: colors.text, lineHeight: 22 },
    heading1: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 12, marginBottom: 8 },
    heading2: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 12, marginBottom: 8 },
    paragraph: { marginBottom: 10 },
    list_item: { marginBottom: 4 },
});
