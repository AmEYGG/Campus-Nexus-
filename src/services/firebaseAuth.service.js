import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updatePassword
} from 'firebase/auth';
import { 
    getDatabase,
    ref,
    set,
    get,
    update,
    remove
} from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { app, auth as firebaseAuth, database as firebaseDatabase } from '../config/firebase';

// Initialize Analytics
const analytics = getAnalytics(app);

class FirebaseAuthService {
    constructor() {
        this.auth = firebaseAuth;
        this.database = firebaseDatabase;
        this.googleProvider = new GoogleAuthProvider();
        // Add scopes for Google Sign-in
        this.googleProvider.addScope('profile');
        this.googleProvider.addScope('email');
    }

    async register(userData) {
        const { email, password, firstName, lastName, role, studentId, department, facultyId } = userData;
        
        try {
            // 1. Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // 2. Update the user's display name in Authentication
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });

            // 3. Create base user profile with common fields
            const baseProfile = {
                user_id: user.uid,
                firstname: firstName,
                lastname: lastName,
                email: email,
                department: department || null,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                role: role // Include role in the profile itself
            };

            // 4. Create role-specific profile with additional fields
            let roleSpecificProfile = {};
            let collectionName = '';

            switch (role) {
                case 'student':
                    collectionName = 'students';
                    roleSpecificProfile = {
                        ...baseProfile,
                        studentID: studentId,
                        enrollmentDate: new Date().toISOString(),
                    };
                    break;

                case 'faculty':
                    collectionName = 'faculty';
                    roleSpecificProfile = {
                        ...baseProfile,
                        facultyID: facultyId,
                        designation: 'Assistant Professor',
                        specialization: department,
                        courses: [],
                        officeHours: []
                    };
                    break;

                case 'admin':
                    collectionName = 'administrators';
                    roleSpecificProfile = {
                        ...baseProfile,
                        designation: 'Administrator',
                        permissions: ['all'],
                        lastAccess: new Date().toISOString()
                    };
                    break;

                default:
                    throw new Error('Invalid role specified');
            }

            // 5. Store role-specific profile in the appropriate collection
            await set(ref(this.database, `${collectionName}/${user.uid}`), roleSpecificProfile);

            return { 
                authUser: user, 
                userProfile: roleSpecificProfile 
            };

        } catch (error) {
            console.error('Firebase Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('A user with this email already exists.');
            } else if (error.code === 'auth/invalid-email' || error.code === 'auth/weak-password') {
                throw new Error(`Registration failed: ${error.message}`);
            }
            throw error;
        }
    }

    async login(email, password) {
        try {
            // 1. Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // 2. Try to find user in each role-specific collection
            const collections = ['administrators', 'faculty', 'students'];
            let userProfile = null;
            let foundCollection = null;

            for (const collection of collections) {
                const profileRef = ref(this.database, `${collection}/${user.uid}`);
                const profileSnapshot = await get(profileRef);
                
                if (profileSnapshot.exists()) {
                    userProfile = profileSnapshot.val();
                    foundCollection = collection;
                    break;
                }
            }

            if (!userProfile) {
                await this.logout();
                throw new Error('Login failed: User profile not found. Please try registering again or contact support.');
            }

            // 3. Update last login timestamp
            const profileRef = ref(this.database, `${foundCollection}/${user.uid}`);
            await update(profileRef, {
                lastLogin: new Date().toISOString()
            });

            return { 
                authUser: user, 
                userProfile: userProfile 
            };

        } catch (error) {
            console.error('Firebase Login error:', error);
            try { await this.logout(); } catch (e) { /* ignore logout errors */ }
            
            if (error.code === 'auth/invalid-credential') {
                throw new Error('Invalid email or password.');
            }
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Firebase Logout error:', error);
            // Don't throw error on logout failure
        }
    }

    async getCurrentUser() {
        try {
            return new Promise((resolve, reject) => {
                const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
                    unsubscribe();

                    if (!user) {
                        resolve(null);
                        return;
                    }

                    try {
                        // Try to find user in each role-specific collection
                        const collections = ['administrators', 'faculty', 'students'];
                        let userProfile = null;

                        for (const collection of collections) {
                            const profileRef = ref(this.database, `${collection}/${user.uid}`);
                            const profileSnapshot = await get(profileRef);
                            
                            if (profileSnapshot.exists()) {
                                userProfile = profileSnapshot.val();
                                break;
                            }
                        }

                        if (!userProfile) {
                            console.warn('User profile not found in any role-specific collection for user ID:', user.uid);
                            await this.logout();
                            resolve(null);
                            return;
                        }

                        resolve({ authUser: user, userProfile: userProfile });
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                        reject(error);
                    }
                }, reject);
            });
        } catch (error) {
            console.error('Firebase getCurrentUser error:', error);
            return null;
        }
    }

    async updateUserProfile(userId, dataToUpdate) {
        try {
            // Find which collection contains the user's profile
            const collections = ['administrators', 'faculty', 'students'];
            let foundCollection = null;

            for (const collection of collections) {
                const profileRef = ref(this.database, `${collection}/${userId}`);
                const profileSnapshot = await get(profileRef);
                
                if (profileSnapshot.exists()) {
                    foundCollection = collection;
                    break;
                }
            }

            if (!foundCollection) {
                throw new Error('Profile not found for update.');
            }

            // Update the profile in the found collection
            const profileRef = ref(this.database, `${foundCollection}/${userId}`);
            await update(profileRef, {
                ...dataToUpdate,
                updatedAt: new Date().toISOString()
            });
            
            // Get the updated profile
            const snapshot = await get(profileRef);
            return snapshot.val();
        } catch (error) {
            console.error('Firebase updateUserProfile error:', error);
            throw error;
        }
    }

    async deleteUserAccount(userId) {
        try {
            const user = this.auth.currentUser;
            if (!user || user.uid !== userId) {
                throw new Error('Unauthorized to delete this account');
            }

            // Find and delete user data from the appropriate collection
            const collections = ['administrators', 'faculty', 'students'];
            for (const collection of collections) {
                const profileRef = ref(this.database, `${collection}/${userId}`);
                const profileSnapshot = await get(profileRef);
                
                if (profileSnapshot.exists()) {
                    await remove(profileRef);
                    break;
                }
            }

            // Delete user from Firebase Authentication
            await user.delete();

            console.log('User account and data deleted successfully');
        } catch (error) {
            console.error('Error deleting user account:', error);
            throw error;
        }
    }

    async signInWithGoogle() {
        try {
            // Sign in with Google
            const result = await signInWithPopup(this.auth, this.googleProvider);
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // Check if user exists in any role-specific collection
            const collections = ['administrators', 'faculty', 'students'];
            let userProfile = null;
            let foundCollection = null;

            for (const collection of collections) {
                const profileRef = ref(this.database, `${collection}/${user.uid}`);
                const profileSnapshot = await get(profileRef);
                
                if (profileSnapshot.exists()) {
                    userProfile = profileSnapshot.val();
                    foundCollection = collection;
                    break;
                }
            }

            // If user doesn't exist, return a special response indicating profile completion is needed
            if (!userProfile) {
                // Create a temporary profile with Google data
                const tempProfile = {
                    user_id: user.uid,
                    email: user.email,
                    firstname: user.displayName?.split(' ')[0] || '',
                    lastname: user.displayName?.split(' ').slice(1).join(' ') || '',
                    photoURL: user.photoURL,
                    authProvider: 'google',
                    isProfileComplete: false,
                    createdAt: new Date().toISOString()
                };

                // Store temporary profile in a special collection
                await set(ref(this.database, `pending_profiles/${user.uid}`), tempProfile);

                return {
                    authUser: user,
                    userProfile: tempProfile,
                    needsProfileCompletion: true
                };
            }

            // For existing users, update last login
            const profileRef = ref(this.database, `${foundCollection}/${user.uid}`);
            await update(profileRef, {
                lastLogin: new Date().toISOString(),
                authProvider: 'google'
            });

            return {
                authUser: user,
                userProfile: userProfile,
                needsProfileCompletion: false
            };

        } catch (error) {
            console.error('Google Sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Sign-in was cancelled. Please try again.');
            }
            throw error;
        }
    }

    async completeGoogleProfile(userId, profileData) {
        try {
            // Get the temporary profile
            const tempProfileRef = ref(this.database, `pending_profiles/${userId}`);
            const tempProfileSnapshot = await get(tempProfileRef);

            if (!tempProfileSnapshot.exists()) {
                throw new Error('Temporary profile not found. Please try signing in again.');
            }

            const tempProfile = tempProfileSnapshot.val();
            const { role, department, studentId, facultyId } = profileData;

            // Create base profile with Google data and new information
            const baseProfile = {
                ...tempProfile,
                department: department || null,
                role: role,
                isProfileComplete: true,
                updatedAt: new Date().toISOString()
            };

            // Create role-specific profile
            let roleSpecificProfile = {};
            let collectionName = '';

            switch (role) {
                case 'student':
                    collectionName = 'students';
                    roleSpecificProfile = {
                        ...baseProfile,
                        studentID: studentId,
                        enrollmentDate: new Date().toISOString()
                    };
                    break;

                case 'faculty':
                    collectionName = 'faculty';
                    roleSpecificProfile = {
                        ...baseProfile,
                        facultyID: facultyId,
                        designation: 'Assistant Professor',
                        specialization: department,
                        courses: [],
                        officeHours: []
                    };
                    break;

                case 'admin':
                    collectionName = 'administrators';
                    roleSpecificProfile = {
                        ...baseProfile,
                        designation: 'Administrator',
                        permissions: ['all'],
                        lastAccess: new Date().toISOString()
                    };
                    break;

                default:
                    throw new Error('Invalid role specified');
            }

            // Store in the appropriate collection
            await set(ref(this.database, `${collectionName}/${userId}`), roleSpecificProfile);

            // Remove temporary profile
            await remove(tempProfileRef);

            return {
                userProfile: roleSpecificProfile
            };

        } catch (error) {
            console.error('Profile completion error:', error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            // Check if email exists in any role-specific collection
            const collections = ['administrators', 'faculty', 'students'];
            let emailExists = false;

            for (const collection of collections) {
                const usersRef = ref(this.database, collection);
                const snapshot = await get(usersRef);
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    if (Object.values(users).some(user => user.email === email)) {
                        emailExists = true;
                        break;
                    }
                }
            }

            if (!emailExists) {
                throw new Error('No account found with this email address.');
            }

            // Send password reset email
            await sendPasswordResetEmail(this.auth, email);
            return true;
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address.');
            } else if (error.code === 'auth/user-not-found') {
                throw new Error('No account found with this email address.');
            }
            throw error;
        }
    }

    async updateUserPassword(oobCode, newPassword) {
        try {
            // Verify the password reset code and update the password
            await confirmPasswordReset(this.auth, oobCode, newPassword);
            return true;
        } catch (error) {
            console.error('Password update error:', error);
            if (error.code === 'auth/expired-action-code') {
                throw new Error('Password reset link has expired. Please request a new one.');
            } else if (error.code === 'auth/invalid-action-code') {
                throw new Error('Invalid password reset link. Please request a new one.');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak. Please choose a stronger password.');
            }
            throw error;
        }
    }

    async updatePasswordForCurrentUser(newPassword) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in.');
            }
            await updatePassword(user, newPassword);
            return true;
        } catch (error) {
            console.error('Password update error:', error);
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('Please sign in again before changing your password.');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak. Please choose a stronger password.');
            }
            throw error;
        }
    }
}

// Create and export a single instance
export const firebaseAuthService = new FirebaseAuthService(); 