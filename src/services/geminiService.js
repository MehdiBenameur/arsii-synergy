import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Initialize the new SDK client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Serializes the current project data into a clean, text-based context 
 * that the LLM can easily understand.
 */
export const buildProjectContext = (project, tasks, teamDetails, users) => {
    if (!project) return "No project data available.";

    let context = `PROJECT CONTEXT:\n`;
    context += `Title: ${project.title || 'Untitled'}\n`;
    context += `Description: ${project.description || 'No description provided.'}\n`;
    context += `Status: ${project.status || 'Unknown'}\n`;
    context += `Timeline: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} to ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}\n\n`;

    if (teamDetails && teamDetails.length > 0) {
        context += `TEAM INVOLVED:\n`;
        teamDetails.forEach(t => {
            const leadName = users.find(u => u.id === t.leadId)?.name || 'Unknown Lead';
            context += `- ${t.name}: Led by ${leadName} (${t.description || ''})\n`;
        });
        context += '\n';
    }

    if (tasks && tasks.length > 0) {
        context += `CURRENT TASKS:\n`;
        
        const todo = tasks.filter(t => t.status === 'todo');
        const inprogress = tasks.filter(t => t.status === 'inprogress');
        const done = tasks.filter(t => t.status === 'done');

        context += `To Do (${todo.length}):\n`;
        todo.forEach(t => context += ` - [ ] ${t.title} (Priority: ${t.priority || 'Normal'})\n`);
        
        context += `In Progress (${inprogress.length}):\n`;
        inprogress.forEach(t => context += ` - [/] ${t.title} (Priority: ${t.priority || 'Normal'})\n`);
        
        context += `Done (${done.length}):\n`;
        done.forEach(t => context += ` - [x] ${t.title}\n`);
    } else {
        context += "CURRENT TASKS: None assigned yet.\n";
    }

    return context;
};

/**
 * Format chat history for the Gemini SDK. 
 * Expected shape of history items: { role: 'user' | 'assistant', text: string }
 */
const formatChatHistoryForGemini = (history) => {
    return history.map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user', // Gemini expects 'model' instead of 'assistant'
        parts: [{ text: item.text }]
    }));
};

/**
 * Sends a chat message to Gemini with system instructions to frame its behavior.
 */
export const chatWithGemini = async (chatHistory, userMessage, projectContext, briefDraft, taskListDraft) => {
    if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key in .env");

    const systemInstruction = `
You are the AI Project Assistant built into ARSII Synergy.
Your job is to help users author and refine a "Project Brief" and a "Task List".
You have access to both documents simultaneously. When the user asks to modify one, you can optionally propose changes to the other if it makes sense (e.g. adding a feature to the brief could add a corresponding task).

Here is the live data for the current project they are working on:
${projectContext}

Here is the CURRENT state of their handwritten Project Brief draft:
"""
${briefDraft || '(Empty - needs to be written)'}
"""

Here is the CURRENT state of their handwritten Task List draft:
"""
${taskListDraft || '(Empty - needs to be written)'}
"""

IMPORTANT RULES:
1. Always output your suggested document updates enclosed in specific XML tags so the app can parse them.
2. If you want to update the Project Brief, output: <project_brief> [markdown content here] </project_brief>. Do not use markdown backticks inside the tag.
3. If you want to update the Task List, output: <task_list> [markdown content here] </task_list>. Do not use markdown backticks inside the tag.
4. You may output one or both tags in a single response depending on what the user requested. If you are not modifying one of the documents, do not output its tag at all.
5. Provide a short conversational reply BEFORE the XML tags to explain what you changed.
6. Keep the tone professional, concise, and action-oriented.
`;

    const contents = [
        ...formatChatHistoryForGemini(chatHistory),
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("No response generated from AI.");
        }

    } catch (error) {
        console.error("chatWithGemini error:", error);
        throw error;
    }
};

/**
 * A one-shot prompt to generate a structured Task List automatically.
 */
export const generateTaskList = async (projectContext) => {
    if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key in .env");

    const prompt = `
Based on the following project context, generate a structured, well-formatted Markdown Task List.
Group the tasks logically (e.g., by status, assignee, or priority).
Use Markdown checkboxes for To-Do/In Progress items, and checked boxes for Done items.
Do not include any conversational text, just output the pure Markdown checklist.

${projectContext}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temperature for more deterministic/structured output
            }
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("No task list generated.");
        }

    } catch (error) {
        console.error("generateTaskList error:", error);
        throw error;
    }
};
