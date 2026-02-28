import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context';
import { useNotifications } from '../context';
import { colors, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Import Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

// User Screens
import { UserDashboard } from '../screens/user/UserDashboard';
import { TaskDetailScreen } from '../screens/user/TaskDetailScreen';

// Lead Screens
import { LeadDashboard } from '../screens/lead/LeadDashboard';
import { CreateTaskScreen } from '../screens/lead/CreateTaskScreen';
import { TeamWorkloadScreen } from '../screens/lead/TeamWorkloadScreen';

// Manager Screens
import { ManagerDashboard } from '../screens/manager/ManagerDashboard';

// Admin Screens
import { AdminDashboard } from '../screens/admin/AdminDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Shared Tab Screens ──

const TabIconWithBadge = ({ name, color, size, badgeCount }) => (
    <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {badgeCount > 0 && (
            <View style={{
                position: 'absolute',
                right: -6,
                top: -3,
                backgroundColor: colors.danger,
                borderRadius: 10,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                </Text>
            </View>
        )}
    </View>
);

const screenOptions = ({ route, unreadCount }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textTertiary,
    tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
    },
    tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: typography.medium,
    },
    tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        let count = 0;

        if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
            count = unreadCount;
        } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
        }

        return <TabIconWithBadge name={iconName} size={24} color={color} badgeCount={count} />;
    },
});

// ── Role Specific Navigators ──

const UserTabs = () => {
    const { user } = useAuth();
    const { getUnreadCount } = useNotifications();

    return (
        <Tab.Navigator screenOptions={(props) => screenOptions({ ...props, unreadCount: getUnreadCount(user.id) })}>
            <Tab.Screen name="Home" component={UserDashboard} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const LeadTabs = () => {
    const { user } = useAuth();
    const { getUnreadCount } = useNotifications();

    return (
        <Tab.Navigator screenOptions={(props) => screenOptions({ ...props, unreadCount: getUnreadCount(user.id) })}>
            <Tab.Screen name="Home" component={LeadDashboard} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const ManagerTabs = () => {
    const { user } = useAuth();
    const { getUnreadCount } = useNotifications();

    return (
        <Tab.Navigator screenOptions={(props) => screenOptions({ ...props, unreadCount: getUnreadCount(user.id) })}>
            <Tab.Screen name="Home" component={ManagerDashboard} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AdminTabs = () => {
    const { user } = useAuth();
    const { getUnreadCount } = useNotifications();

    return (
        <Tab.Navigator screenOptions={(props) => screenOptions({ ...props, unreadCount: getUnreadCount(user.id) })}>
            <Tab.Screen name="Home" component={AdminDashboard} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// ── Main App Navigator ──

export const AppNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // Let the splash screen or a loader show (handled in App.js usually)
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Auth Stack
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
                // App Stack branching by role
                <>
                    {user.role === 'admin' && <Stack.Screen name="Root" component={AdminTabs} />}
                    {user.role === 'manager' && <Stack.Screen name="Root" component={ManagerTabs} />}
                    {user.role === 'lead' && <Stack.Screen name="Root" component={LeadTabs} />}
                    {user.role === 'user' && <Stack.Screen name="Root" component={UserTabs} />}

                    {/* Shared Modals & Details across roles */}
                    <Stack.Screen
                        name="TaskDetail"
                        component={TaskDetailScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="CreateTask"
                        component={CreateTaskScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="TeamWorkload"
                        component={TeamWorkloadScreen}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
