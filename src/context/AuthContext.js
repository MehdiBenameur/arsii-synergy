import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Predefined colors for new avatars
const AVATAR_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch the user's role and details from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUser({ id: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
                } else {
                    // Fallback if firestore document doesn't exist
                    setUser({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || 'User', role: 'user' });
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const register = async (email, password, name, role, teamId = null) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;

            await updateProfile(fbUser, { displayName: name });

            const avatarBg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
            const userInitial = name.charAt(0).toUpperCase();

            const newUserDoc = {
                name,
                role, // 'admin', 'manager', 'lead', or 'user'
                teamId,
                avatar: userInitial,
                avatarColor: avatarBg,
                status: 'active'
            };

            await setDoc(doc(db, 'users', fbUser.uid), newUserDoc);

            // The onAuthStateChanged listener will pick up the login and set the state.
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
