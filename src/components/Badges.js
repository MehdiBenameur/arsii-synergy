import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor, getPriorityColor, borderRadius, spacing, typography, colors } from '../theme';

export const StatusBadge = ({ status, style }) => {
    const { bg, text, label } = getStatusColor(status);

    return (
        <View style={[styles.badge, { backgroundColor: bg }, style]}>
            <Text style={[styles.text, { color: text }]}>{label}</Text>
        </View>
    );
};

export const PriorityBadge = ({ priority, style }) => {
    const { color, label } = getPriorityColor(priority);

    return (
        <View style={[styles.badge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1 }, style]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.text, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: typography.xs,
        fontWeight: typography.medium,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    }
});
