import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme';

export const SearchBar = ({ value, onChangeText, onClear, placeholder = "Search tasks..." }) => {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChangeText}
                autoCorrect={false}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear}>
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    icon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },
});
