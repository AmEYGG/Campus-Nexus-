import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jngpcmkfaquwvqagrjjb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZ3BjbWtmYXF1d3ZxYWdyampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjYxOTAsImV4cCI6MjA2MzM0MjE5MH0.3pl9BPPO0d2d5fp-l7C6jSVKs_bSqX78TfqymreCYPw'; // Public API Key

// Create a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 