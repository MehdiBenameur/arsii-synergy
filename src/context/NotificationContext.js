import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { db } from '../services/firebaseConfig';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import uuid from 'react-native-uuid';
import { format } from 'date-fns';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [expoPushToken, setExpoPushToken] = useState('');

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        // 1. Get Push Token and save to user doc
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
                updateDoc(doc(db, 'users', user.id), { expoPushToken: token }).catch(console.error);
            }
        });

        // 2. Listen to this user's notifications from Firestore
        const q = query(collection(db, 'notifications'), where('userId', '==', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort by createdAt descending locally
            notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(notifs);
        }, (error) => {
            console.error("Notification Snapshot error:", error);
        });

        return () => unsubscribe();
    }, [user]);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Permission not granted for push notifications.');
                return;
            }

            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                token = tokenData.data;
            } catch (error) {
                console.log('Error getting push token', error);
                // Fallback for simple expo go without EAS
                try {
                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    token = tokenData.data;
                } catch (e) {
                    console.log('Fallback failed', e);
                }
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    const getUnreadCount = (userId) => {
        return notifications.filter(n => !n.read).length;
    };

    const getUserNotifications = (userId) => {
        return notifications;
    };

    const markAsRead = async (notificationId) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), { read: true });
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async (userId) => {
        try {
            const unread = notifications.filter(n => !n.read);
            for (const n of unread) {
                await updateDoc(doc(db, 'notifications', n.id), { read: true });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const sendPushNotification = async (expoPushToken, title, body) => {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: { someData: 'goes here' },
        };

        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        } catch (error) {
            console.error('Error sending push notification', error);
        }
    };

    const addNotification = async (notificationData) => {
        try {
            const notifId = `notif_${uuid.v4().substring(0, 8)}`;
            const newNotif = {
                id: notifId,
                read: false,
                createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                ...notificationData
            };

            // 1. Save to DB
            await setDoc(doc(db, 'notifications', notifId), newNotif);

            // 2. Fetch target user's push token and send real push notification
            if (notificationData.userId) {
                const userDoc = await getDoc(doc(db, 'users', notificationData.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.expoPushToken) {
                        await sendPushNotification(
                            userData.expoPushToken,
                            notificationData.title,
                            notificationData.message
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            getUnreadCount,
            getUserNotifications,
            markAsRead,
            markAllAsRead,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
