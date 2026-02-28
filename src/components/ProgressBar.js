import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius } from '../theme';

export const ProgressBar = ({ progress = 0, color = colors.primary, height = 6, style }) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={[styles.container, { height }, style]}>
            <Animated.View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress}%`,
                        backgroundColor: color
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        width: '100%',
    },
    fill: {
        height: '100%',
        borderRadius: borderRadius.full,
    }
});
