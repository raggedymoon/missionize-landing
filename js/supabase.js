/**
 * Supabase Configuration for Missionize
 * Initializes Supabase client for authentication and database access
 */

// Supabase credentials
// SECURITY NOTE: These credentials are INTENTIONALLY PUBLIC (anon key, not service_role).
// Supabase anon keys are designed to be exposed in frontend code.
// Data security is enforced by Row Level Security (RLS) policies on the database.
// NEVER expose service_role keys in frontend code.
const SUPABASE_URL = 'https://blgqnzcanuszinjckspp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ3FuemNhbnVzemluamNrc3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyNDgsImV4cCI6MjA4MDA5MzI0OH0.4yOM98qyk-UJ2pYPRsT_stXCv8poT0lO8qeMdf7MwNM';

// Initialize Supabase client
// Note: This requires @supabase/supabase-js to be loaded via CDN in HTML
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!supabase) {
    console.error('Supabase client failed to initialize. Make sure @supabase/supabase-js is loaded.');
}

/**
 * Get current user session from Supabase
 * @returns {Promise<object|null>} User object or null if not authenticated
 */
async function getCurrentUser() {
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting current user:', error);
        return null;
    }
    return user;
}

/**
 * Get user profile from profiles table
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>} Profile object or null
 */
async function getUserProfile(userId) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
    return data;
}

/**
 * Get user's API keys from profiles table
 * @param {string} userId - User UUID
 * @returns {Promise<string|null>} API key or null
 */
async function getUserApiKey(userId) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting API key:', error);
        return null;
    }
    return data?.api_key || null;
}

/**
 * Get user's mission usage stats
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>} Usage stats object
 */
async function getUserUsageStats(userId) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('missions_used_this_month, missions_limit, plan')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting usage stats:', error);
        return null;
    }
    return data;
}

/**
 * Sign up new user with Supabase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Result object with user or error
 */
async function signUp(email, password) {
    if (!supabase) {
        return { error: { message: 'Supabase client not initialized' } };
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    return { data, error };
}

/**
 * Sign in user with Supabase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Result object with session or error
 */
async function signIn(email, password) {
    if (!supabase) {
        return { error: { message: 'Supabase client not initialized' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    return { data, error };
}

/**
 * Sign out current user
 * @returns {Promise<object>} Result object with error if any
 */
async function signOut() {
    if (!supabase) {
        return { error: { message: 'Supabase client not initialized' } };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
async function isUserAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}
