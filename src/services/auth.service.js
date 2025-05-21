import { supabase } from '../config/supabase.config';

class AuthService {
    async register(userData) {
        const { email, password, firstName, lastName, role, studentId, department } = userData;
        // Add check to ensure only students can register
        if (role !== 'student') {
            throw new Error('Only students are allowed to register.');
        }
        try {
            // 1. Supabase Auth registration
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                // We will not store additional data in metadata now, but in the user_profiles table
                // options: {
                //     data: { ... }
                // }
            });

            if (authError) {
                console.error('Supabase Auth registration error:', authError);
                throw new Error(authError.message);
            }

            const newUser = authData.user; // Get the newly created auth user
            console.log('Supabase Auth user created:', newUser);

            // 2. Insert user data into the 'user_profiles' table
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles') // Ensure you have a table named 'user_profiles'
                .insert([
                    { 
                        id: newUser.id, // Link profile to auth user using the same ID
                        first_name: firstName, // Use first_name column
                        last_name: lastName, // Use last_name column
                        role: role,
                        student_id: studentId || null, // Use snake_case for column names
                        department: department || null,
                        email: email // Store email for easy access
                    }
                ]);

            if (profileError) {
                console.error('Supabase profile insertion error:', profileError);
                // Consider deleting the auth user if profile creation fails to avoid orphaned users
                // await supabase.auth.admin.deleteUser(newUser.id); // Requires service role key (server-side)
                throw new Error(`Profile creation failed: ${profileError.message}`);
            }

            console.log('User profile created in DB:', profileData);

            // Supabase returns a session immediately after signup if email confirmation is off.
            // If email confirmation is on, session is null until email is confirmed.
            // Return the created user and potentially the profile data
            return { authUser: newUser, userProfile: profileData ? profileData[0] : null };

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            // 1. Supabase Auth login
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (authError) {
                console.error('Supabase Auth login error:', authError);
                throw new Error(authError.message);
            }

            const authUser = data.user; // Get the authenticated user
            console.log('User logged in successfully:', authUser);

            if (!authUser) {
                 throw new Error('Login failed: Authentication successful but no user data returned.');
            }

            // 2. Fetch the user's profile from 'user_profiles' table
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*') // Select all columns from the profile
                .eq('id', authUser.id) // Find profile where id matches auth user id
                .single(); // Expecting a single result

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
                 console.error('Supabase profile fetch error during login:', profileError);
                 // Consider logging out the user if profile fetching fails (except for not found)
                 await supabase.auth.signOut();
                 throw new Error(`Login failed: Could not fetch user profile. ${profileError.message}`);
            }

            if (!profileData) {
                 console.error('User profile not found in DB for user ID:', authUser.id);
                  // If profile is not found, it means registration was incomplete.
                 // Log out the user and inform them.
                 await supabase.auth.signOut();
                 throw new Error('Login failed: User profile missing. Please try registering again or contact support.');
            }

            console.log('User profile fetched from DB:', profileData);

            // Return session, auth user data, and profile data
            return { session: data.session, authUser, userProfile: profileData };

        } catch (error) {
            console.error('Login error:', error);
             // Ensure logout on login failure, but avoid infinite loops if signOut also fails
             try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
            throw error; // Re-throw the original login error
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Supabase Auth logout error:', error);
                throw new Error(error.message);
            }
            console.log('User logged out successfully.');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            // 1. Get the current authenticated user from Supabase Auth
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('Supabase Auth get user error:', authError);
                return null;
            }

            if (!authUser) {
                return null; // No logged in user
            }

            console.log('Current auth user fetched:', authUser);

            // 2. Fetch the user's profile from 'user_profiles' table
             const { data: profileData, error: profileError } = await supabase
                 .from('user_profiles')
                 .select('*')
                 .eq('id', authUser.id)
                 .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
                 console.error('Supabase profile fetch error in getCurrentUser:', profileError);
                 // Decide how to handle this - maybe log out or return partial data
                 // For now, we'll log out if fetching the profile fails unexpectedly
                  await supabase.auth.signOut();
                  console.error('Logged out due to profile fetch error in getCurrentUser.');
                  return null;
            }

             if (!profileData) {
                  console.warn('User profile not found in DB for logged-in user ID:', authUser.id);
                  // If auth user exists but profile is missing, something is wrong.
                  // Log out to ensure consistent state.
                  await supabase.auth.signOut();
                  console.warn('Logged out due to missing profile in getCurrentUser.');
                  return null;
             }

            console.log('User profile fetched from DB in getCurrentUser:', profileData);

            // Return auth user data and profile data
            return { authUser, userProfile: profileData };

        } catch (error) {
            console.error('getCurrentUser error:', error);
            return null; // Handle unexpected errors gracefully
        }
    }

    // You might add methods here for updating the 'user_profiles' table
    async updateUserProfile(userId, dataToUpdate) {
        try {
            console.log('Simulating updateUserProfile for userId:', userId, 'data:', dataToUpdate);
            // In a real scenario, you would update the user_profiles table here
            // Example:
            // const { data, error } = await supabase
            //     .from('user_profiles')
            //     .update(dataToUpdate)
            //     .eq('id', userId);
            // if (error) throw error;
            // return data;
             console.log('Simulated profile update successful.');
            return { $id: userId, ...dataToUpdate }; // Simulate success
        } catch (error) {
            console.error('updateUserProfile error:', error);
            throw error;
        }
    }

     // You might add methods here for fetching profile from DB if needed elsewhere
     async getUserProfileFromDB(userId) {
         try {
             console.log('Simulating getUserProfileFromDB for userId:', userId);
             const { data: profileData, error: profileError } = await supabase
                 .from('user_profiles')
                 .select('*')
                 .eq('id', userId)
                 .single();

             if (profileError && profileError.code !== 'PGRST116') {
                  console.error('Supabase profile fetch error in getUserProfileFromDB:', profileError);
                  throw new Error(`Could not fetch user profile: ${profileError.message}`);
             }
             
             if (!profileData) {
                 console.warn('User profile not found in DB for user ID:', userId);
                 return null;
             }
             console.log('User profile fetched from DB:', profileData);
             return profileData;
         } catch (error) {
              console.error('getUserProfileFromDB error:', error);
             throw error;
         }
     }
}

export const authService = new AuthService();
export default authService; 