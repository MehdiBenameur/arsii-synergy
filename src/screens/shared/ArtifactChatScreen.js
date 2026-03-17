import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { useArtifacts } from '../../context/ArtifactContext';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { buildProjectContext, chatWithGemini } from '../../services/geminiService';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const ArtifactChatScreen = ({ route, navigation }) => {
    // We keep `route.params.type` just to know which tab to open first if we want, but default to 'Chat'.
    const { projectId, type } = route.params; 
    const { user } = useAuth();
    const { getProjectById, getTasksForProject, teams, users } = useProjects();
    const { getUserDraft, getUserWorkspace, saveUnifiedDrafts, isDraftsLoaded, isGenerating } = useArtifacts();

    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [briefContent, setBriefContent] = useState('');
    const [taskContent, setTaskContent] = useState('');
    const [activeTab, setActiveTab] = useState('Chat'); // 'Chat', 'Brief', 'Tasks'
    const [isLoading, setIsLoading] = useState(false);
    const [projectContext, setProjectContext] = useState('');
    
    const flatListRef = useRef(null);
    const hasAttemptedAutoGenerate = useRef(false);

    // Build system context
    useEffect(() => {
        const project = getProjectById(projectId);
        const tasks = getTasksForProject(projectId);
        const projectTeams = teams.filter(t => project?.teamIds?.includes(t.id));
        const ctx = buildProjectContext(project, tasks, projectTeams, users);
        setProjectContext(ctx);
    }, [projectId]);

    // Initialize drafts
    useEffect(() => {
        if (!isDraftsLoaded || !projectContext) return;

        const briefDraft = getUserDraft(projectId, 'main');
        const taskDraft = getUserDraft(projectId, 'tasklist');
        const workspace = getUserWorkspace(projectId);

        if (briefDraft || taskDraft || workspace) {
            setBriefContent(briefDraft?.content || '');
            setTaskContent(taskDraft?.content || '');
            setChatHistory(workspace?.chatHistory || []);
        } else if (!hasAttemptedAutoGenerate.current) {
            hasAttemptedAutoGenerate.current = true;
            // First time opening — auto-generate initial content based on context
            autoGenerateInitialDraft(projectContext);
        }
    }, [projectId, type, isDraftsLoaded, projectContext]);

    const autoGenerateInitialDraft = async (contextData) => {
        setIsLoading(true);
        try {
            const initialPrompt = "Generate a comprehensive initial Project Brief and a structured Task List based on the project context. Output them using the <project_brief> and <task_list> xml tags respectively. Add a short introductory message before the tags.";

            const aiResponseText = await chatWithGemini([], initialPrompt, contextData, '', '');
            
            // Extract Markdown content
            const briefMatch = aiResponseText.match(/<project_brief>([\s\S]*?)<\/project_brief>/);
            const taskMatch = aiResponseText.match(/<task_list>([\s\S]*?)<\/task_list>/);
            
            const updatedBrief = briefMatch ? briefMatch[1].trim() : '';
            const updatedTask = taskMatch ? taskMatch[1].trim() : '';

            setBriefContent(updatedBrief);
            setTaskContent(updatedTask);
            
            const conversationalText = aiResponseText
                .replace(/<project_brief>[\s\S]*?<\/project_brief>/g, '')
                .replace(/<task_list>[\s\S]*?<\/task_list>/g, '')
                .trim();
            
            const initialHistory = [
                { id: 'welcome', role: 'assistant', text: conversationalText || `Hi ${user.name.split(' ')[0]}! I've gone ahead and generated an initial Project Brief and Task List based on your project data. Check the tabs above to review them, and let me know here if you'd like to add or change anything!` }
            ];
            setChatHistory(initialHistory);

            // Save the initial draft to Firestore
            await saveUnifiedDrafts(projectId, updatedBrief, updatedTask, initialHistory);

        } catch (error) {
            console.error("Auto-generation failed:", error);
            setChatHistory([
                { id: 'welcome', role: 'assistant', text: `Hi ${user.name.split(' ')[0]}! I'm your AI assistant. I couldn't auto-generate the content right now. Tell me what you'd like to do.` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userText = message.trim();
        setMessage('');
        
        const newHistory = [...chatHistory, { id: Date.now().toString(), role: 'user', text: userText }];
        setChatHistory(newHistory);
        setIsLoading(true);

        try {
            // We only send the user/assistant messages to Gemini, stripping our welcome ID wrapper
            const geminiHistory = newHistory.map(h => ({ role: h.role, text: h.text }));
            
            // The response will contain both conversational text AND markdown updates
            const aiResponseText = await chatWithGemini(geminiHistory, userText, projectContext, briefContent, taskContent);
            
            const briefMatch = aiResponseText.match(/<project_brief>([\s\S]*?)<\/project_brief>/);
            const taskMatch = aiResponseText.match(/<task_list>([\s\S]*?)<\/task_list>/);
            
            const updatedBrief = briefMatch ? briefMatch[1].trim() : briefContent;
            const updatedTask = taskMatch ? taskMatch[1].trim() : taskContent;

            setBriefContent(updatedBrief);
            setTaskContent(updatedTask);

            const conversationalText = aiResponseText
                .replace(/<project_brief>[\s\S]*?<\/project_brief>/g, '')
                .replace(/<task_list>[\s\S]*?<\/task_list>/g, '')
                .trim();

            const finalChatText = conversationalText || "*(Updated documents)*";

            const finalHistory = [
                ...newHistory, 
                { id: (Date.now() + 1).toString(), role: 'assistant', text: finalChatText }
            ];
            
            setChatHistory(finalHistory);
            
            // Save to Firestore
            await saveUnifiedDrafts(projectId, updatedBrief, updatedTask, finalHistory);

        } catch (error) {
            console.error("Chat error:", error);
            if (Platform.OS === 'web') {
                window.alert(`AI Error: ${error.message || 'Something went wrong.'}`);
            } else {
                Alert.alert("AI Error", error.message || 'Something went wrong.');
            }
            // Reset chat history to what it was before the failed user message
            setChatHistory(chatHistory);
        } finally {
            setIsLoading(false);
        }
    };

    const isLeadOrManager = user.role === 'lead' || user.role === 'manager';

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, activeTab === 'Chat' && styles.toggleActive]} 
                        onPress={() => setActiveTab('Chat')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'Chat' && styles.toggleTextActive]}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, activeTab === 'Brief' && styles.toggleActive]} 
                        onPress={() => setActiveTab('Brief')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'Brief' && styles.toggleTextActive]}>Brief</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, activeTab === 'Tasks' && styles.toggleActive]} 
                        onPress={() => setActiveTab('Tasks')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'Tasks' && styles.toggleTextActive]}>Tasks</Text>
                    </TouchableOpacity>
                </View>

                {isLeadOrManager ? (
                    <TouchableOpacity 
                        style={styles.publishBtn} 
                        onPress={() => navigation.navigate('DiffView', { projectId, type: activeTab === 'Tasks' ? 'tasklist' : 'main' })}
                    >
                        <Text style={styles.publishBtnText}>Publish ✨</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 80 }} /> 
                )}
            </View>

            {/* Main Area */}
            <KeyboardAvoidingView 
                style={styles.keyboardView} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {activeTab !== 'Chat' ? (
                    <ScrollView style={styles.previewContainer}>
                        {activeTab === 'Brief' ? (
                            briefContent ? (
                                <Markdown style={markdownStyles}>{briefContent}</Markdown>
                            ) : (
                                <View style={styles.emptyDraft}>
                                    <Text style={styles.emptyDraftText}>Your brief draft is empty. Chat with the AI to generate content.</Text>
                                </View>
                            )
                        ) : (
                            taskContent ? (
                                <Markdown style={markdownStyles}>{taskContent}</Markdown>
                            ) : (
                                <View style={styles.emptyDraft}>
                                    <Text style={styles.emptyDraftText}>Your task list draft is empty. Chat with the AI to generate content.</Text>
                                </View>
                            )
                        )}
                    </ScrollView>
                ) : (
                    <>
                        <FlatList
                            ref={flatListRef}
                            data={chatHistory}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.chatList}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                        
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadingText}>Thinking...</Text>
                            </View>
                        )}

                        <View style={styles.inputBar}>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Add a section about risk mitigation..."
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, (!message.trim() || isLoading) && styles.sendBtnDisabled]} 
                                onPress={handleSend}
                                disabled={!message.trim() || isLoading}
                            >
                                <Ionicons name="send" size={20} color={colors.surface} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    iconBtn: { padding: spacing.xs },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: 2,
    },
    toggleBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: borderRadius.sm,
    },
    toggleActive: {
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: typography.medium,
        color: colors.textSecondary,
    },
    toggleTextActive: {
        color: colors.primary,
        fontWeight: typography.bold,
    },
    publishBtn: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    publishBtnText: {
        color: colors.primary,
        fontWeight: typography.bold,
        fontSize: 13,
    },
    keyboardView: { flex: 1 },
    chatList: { padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
    messageBubble: {
        maxWidth: '85%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderBottomLeftRadius: 4,
    },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: colors.surface },
    aiText: { color: colors.text },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.sm,
    },
    loadingText: { fontSize: 13, color: colors.textSecondary, marginLeft: spacing.xs, fontStyle: 'italic' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingTop: 12,
        paddingBottom: 12,
        maxHeight: 100,
        fontSize: 15,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
        marginBottom: 2,
    },
    sendBtnDisabled: { backgroundColor: colors.border },
    previewContainer: { flex: 1, padding: spacing.lg },
    emptyDraft: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyDraftText: { color: colors.textTertiary, fontStyle: 'italic' },
});

const markdownStyles = StyleSheet.create({
    body: { fontSize: 16, color: colors.text, lineHeight: 24 },
    heading1: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
    heading2: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
    paragraph: { marginBottom: 12 },
    list_item: { marginBottom: 4 },
});
