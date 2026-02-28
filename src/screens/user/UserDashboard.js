import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { TaskCard, SearchBar } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const UserDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const { getTasksForUser } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const userTasks = getTasksForUser(user.id);

    const filteredTasks = useMemo(() => {
        return userTasks
            .filter(task => {
                const matchesSearch =
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }, [userTasks, searchQuery, statusFilter]);

    const todoCount = userTasks.filter(t => t.status === 'todo').length;
    const inProgressCount = userTasks.filter(t => t.status === 'inprogress').length;
    const doneCount = userTasks.filter(t => t.status === 'done').length;

    const handleTaskPress = (taskId) => {
        navigation.navigate('TaskDetail', { taskId });
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user.name.split(' ')[0]}</Text>
                <Text style={styles.subtitle}>Here is your workload overview</Text>
            </View>

            <View style={styles.searchSection}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search your tasks..."
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

            <FlatList
                data={filteredTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onPress={() => handleTaskPress(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            {searchQuery || statusFilter !== 'all' ? "No tasks match your filters" : "All caught up!"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery || statusFilter !== 'all' ? "Try adjusting your search or filters" : "You have no tasks assigned right now."}
                        </Text>
                    </View>
                }
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
        paddingBottom: spacing.sm,
    },
    greeting: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
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
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['4xl'],
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
