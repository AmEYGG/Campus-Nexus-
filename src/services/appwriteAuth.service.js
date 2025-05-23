import { ID, Query, Permission, Role } from 'appwrite';
import { account, databases, client } from '../config/appwrite.config';

// --- Configuration ---
const DATABASE_ID = '682cc58b003717b8f2b8'; // <-- Replace with your actual database ID (e.g. 'campus_nexus_db')
const USER_PROFILES_COLLECTION_ID = '682cc598002c2ae4ffc8'; // Use the provided users collection ID

class AppwriteAuthService {
    async register(userData) {
        const { email, password, firstName, lastName, role, studentId, department } = userData;        try {
            const user = await account.create(
                ID.unique(),
                email,
                password,
                `${firstName} ${lastName}` // Name (optional)
            );

            console.log('Appwrite Auth user created:', user);            // Create a session for the new user
            const session = await account.createSession(email, password);
            
            // The session is automatically handled by the Appwrite SDK
            // No need to manually set the session            // Create User Profile Document in the users collection (now authorized)            // Create User Profile Document with a unique ID
            const profileDocument = await databases.createDocument(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                ID.unique(), // Use Appwrite's ID.unique() for document ID
                {
                    user_id: user.$id, // Link profile to auth user
                    firstname: firstName,
                    lastname: lastName,
                    role: role,
                    studentID: studentId || null,
                    department: department || null,
                    email: email
                },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.write(Role.user(user.$id))
                ]
            );

            console.log('User profile document created in Appwrite DB:', profileDocument);

            return { authUser: user, userProfile: profileDocument };

        } catch (error) {
            console.error('Appwrite Registration error:', error);
            if (error.code === 409) {
                 throw new Error('A user with this email already exists.');
            } else if (error.code === 400) {
                 // Appwrite gives specific messages for password/email format errors
                 throw new Error(`Registration failed: ${error.message || 'Invalid input.'}`);
            }
            // Handle other errors like network issues
            throw error;
        }
    }


    async login(email, password) {
        try {
            // Appwrite Auth Login (Create Session)
            // In the browser SDK, createEmailSession logs the user in and sets the session automatically.
            const session = await account.createEmailSession(email, password);
            console.log('User logged in successfully (Session created):', session);

            // Get the User Account Details
            // account.get() fetches the currently logged-in user based on the active session.
            const user = await account.get();
            console.log('Current Appwrite Auth user fetched:', user);

            if (!user) {
                 // This should rarely happen after a successful createEmailSession, but included for robustness.
                 await this.logout(); // Ensure logout if user data is missing
                 throw new Error('Login failed: Authentication successful, but user data could not be retrieved.');
            }

            // Fetch the User's Profile from 'users' collection
            // listDocuments requires databaseId, collectionId, and an array of queries (optional)
            const profileResponse = await databases.listDocuments(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                [
                    // Query to find the profile where user_id equals the logged-in user's ID
                    Query.equal('user_id', user.$id),
                    // Optionally, limit to 1 result if you expect only one profile per user
                    Query.limit(1)
                ]
            );

            const profileDocuments = profileResponse.documents;
            console.log('User profile documents fetched from Appwrite DB:', profileDocuments);

            if (profileDocuments.length === 0) {
                 console.error('User profile document not found in Appwrite DB for user ID:', user.$id);
                 // If profile is not found, it might indicate an incomplete registration.
                 // Decide how to handle this - maybe log out or return partial data.
                 // For now, we'll log out and inform the user.
                 await this.logout();
                 throw new Error('Login failed: User profile missing. Please try registering again or contact support.');
            }

            // Assuming one profile per user, take the first document
            const userProfile = profileDocuments[0];

            // Return session, auth user data, and profile data
            // Note: Appwrite session handling might differ slightly from Supabase.
            // You might need to store the session token (session.providerAccessToken) in your app's state management.
            // However, createEmailSession in browser SDK usually handles session setting automatically.
            return { session: session, authUser: user, userProfile: userProfile };

        } catch (error) {
            console.error('Appwrite Login error:', error);
            // Ensure logout on login failure
            try { await this.logout(); } catch (e) { /* ignore logout errors during login failure */ }
            // Handle specific Appwrite errors if needed (e.g., 401 for invalid credentials)
            if (error.code === 401) {
                 throw new Error('Invalid email or password.');
            }
            // Rethrow other errors
            throw error;
        }
    }


    async logout() {
        try {
            // Appwrite Auth Logout (Delete Current Session)
            // In the browser SDK, deleteSession('current') or deleteSession(sessionId)
            const result = await account.deleteSession('current'); // Deletes the 'current' active session
            console.log('User logged out successfully (Session deleted).');
            // You should also clear any stored session tokens on the client side (e.g., in localStorage, state management) if you were manually managing them.
            // Appwrite browser SDK handles session cookies/local storage automatically usually.
        } catch (error) {
            // Ignore errors if the user is already logged out or the session is invalid (e.g., 401)
            if (error.code === 401) {
                 console.log('Logout called, but no active session found (already logged out?).');
                 return;
            }
            console.error('Appwrite Logout error (non-401):', error);
            // Optionally rethrow if you want to handle other logout errors
            // throw error;
        }
    }


    async getCurrentUser() {
        try {
            // Get the Current Appwrite Auth User
            // account.get() checks for an active session and returns the user or throws 401.
            const user = await account.get();
            console.log('Current Appwrite Auth user fetched in getCurrentUser:', user);

            if (!user) {
                return null; // No logged-in user or session expired/invalid
            }

            // Fetch the User's Profile from 'users' collection
            // listDocuments requires databaseId, collectionId, and an array of queries (optional)
            const profileResponse = await databases.listDocuments(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                [Query.equal('user_id', user.$id)]
            );

            const profileDocuments = profileResponse.documents;
            console.log('User profile documents fetched from Appwrite DB in getCurrentUser:', profileDocuments);

            // Similar logic to login - handle missing profile
            if (profileDocuments.length === 0) {
                 console.warn('User profile document not found in Appwrite DB for logged-in user ID:', user.$id);
                 // Decide how to handle missing profile (e.g., log out, return partial data)
                 // For now, log out to ensure consistent state.
                 await this.logout(); // Logs out the user if their profile is somehow missing.
                 // Clear any local session storage if needed
                 // localStorage.removeItem('appwrite_session'); // Example
                 console.warn('Logged out due to missing profile in getCurrentUser.');
                 return null;
            }

            const userProfile = profileDocuments[0]; // Get the first (and hopefully only) profile

            // Return auth user data and profile data
            return { authUser: user, userProfile: userProfile };

        } catch (error) {
            // Ignore 401 (Unauthorized) errors, as they likely mean the user is simply not logged in
            if (error.code === 401) {
                 console.log('getCurrentUser called, but no active session found (not logged in).');
                 return null;
            }
            console.error('Appwrite getCurrentUser error (non-401):', error);
            // Handle other potential errors (e.g., network issues) - maybe return null or partial data
            return null;
        }
    }


    // --- Placeholder for Profile Update (Implement as needed) ---
    // async updateUserProfile(userId, dataToUpdate) {
    //     try {
    //         // 1. Find the profile document ID for the given userId (user_id)
    //         const profileResponse = await databases.listDocuments(
    //             DATABASE_ID,
    //             USER_PROFILES_COLLECTION_ID,
    //             [Query.equal('user_id', userId)]
    //         );
    //         const profileDoc = profileResponse.documents[0];
    //         if (!profileDoc) throw new Error('Profile not found for update.');
    //
    //         // 2. Update the document
    //         const updatedDoc = await databases.updateDocument(
    //             DATABASE_ID,
    //             USER_PROFILES_COLLECTION_ID,
    //             profileDoc.$id, // Use the document's unique ID
    //             dataToUpdate // Ensure dataToUpdate matches your collection's attributes
    //         );
    //         console.log('User profile updated in Appwrite DB:', updatedDoc);
    //         return updatedDoc;
    //     } catch (error) {
    //         console.error('Appwrite updateUserProfile error:', error);
    //         throw error;
    //     }
    // }


    // --- Placeholder for Fetching Profile (Implement if needed elsewhere) ---
    // async getUserProfileFromDB(userId) {
    //     try {
    //         const profileResponse = await databases.listDocuments(
    //             DATABASE_ID,
    //             USER_PROFILES_COLLECTION_ID,
    //             [Query.equal('user_id', userId)]
    //         );
    //         const profileDoc = profileResponse.documents[0];
    //         if (!profileDoc) {
    //              console.warn('User profile not found in Appwrite DB for user ID:', userId);
    //              return null;
    //         }
    //         console.log('User profile fetched from Appwrite DB (getUserProfileFromDB):', profileDoc);
    //         return profileDoc;
    //     } catch (error) {
    //          console.error('Appwrite getUserProfileFromDB error:', error);
    //          throw error;
    //     }
    // }
}

export const appwriteAuthService = new AppwriteAuthService();
export default appwriteAuthService; 