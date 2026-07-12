// ==========================================================================
// LENO-RAA COLD PROCESS SOAP - SUPABASE CLIENT INITIALIZATION
// ==========================================================================

/**
 * Initializes and exposes the Supabase client.
 * This script expects the Supabase JS CDN script to be loaded in index.html:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

// Replace these placeholders with your actual Supabase Project credentials,
// or set them dynamically on the window object before importing this script.
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://tyjtyixkzoetyrtywceg.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5anR5aXhrem9ldHlydHl3Y2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3Mzg4NDAsImV4cCI6MjA5OTMxNDg0MH0.5sxyYC2G52jCNrrY-M_KAfcqDZKsFkLjKIEu2oJ1S2w';

if (!window.supabase) {
    console.error(
        "Supabase JS SDK (window.supabase) is not detected.\n" +
        "Please ensure the following CDN script tag is included in index.html before this script:\n" +
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
    );
}

// Expose client globally using a dynamic getter to prevent race conditions during async CDN loads
let _supabaseClientInstance = null;
Object.defineProperty(window, 'supabaseClient', {
    get: function() {
        if (!_supabaseClientInstance && window.supabase) {
            const url = window.ENV_SUPABASE_URL || 'https://tyjtyixkzoetyrtywceg.supabase.co';
            const key = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5anR5aXhrem9ldHlydHl3Y2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3Mzg4NDAsImV4cCI6MjA5OTMxNDg0MH0.5sxyYC2G52jCNrrY-M_KAfcqDZKsFkLjKIEu2oJ1S2w';
            
            _supabaseClientInstance = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            
            // Set up reactive auth state change listener once client is created
            setupClientAuthListener(_supabaseClientInstance);
        }
        return _supabaseClientInstance;
    },
    configurable: true,
    enumerable: true
});

function setupClientAuthListener(client) {
    client.auth.onAuthStateChange(async (event, session) => {
        console.log(`Leno-Raa Auth State: ${event}`, session ? {
            id: session.user.id,
            email: session.user.email
        } : 'No active session');

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            const user = session.user;
            try {
                const { data: profile } = await client
                    .from('profiles')
                    .select('*')
                    .eq('auth_user_id', user.id)
                    .maybeSingle();

                if (!profile) {
                    console.log("Auto-creating missing database profile for user:", user.id);
                    await client.from('profiles').insert({
                        auth_user_id: user.id,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Guest Soap Lover',
                        email: user.email || '',
                        phone: user.phone || null,
                        avatar_url: user.user_metadata?.avatar_url || null,
                        provider: user.app_metadata?.provider || 'google',
                        provider_id: user.user_metadata?.sub || user.id,
                        last_login: new Date().toISOString()
                    });
                } else {
                    console.log("Updating last login timestamp for user:", user.id);
                    await client.from('profiles').update({
                        last_login: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).eq('auth_user_id', user.id);
                }
            } catch (e) {
                console.error("Auth listener profile syncing error:", e.message);
            }
        }
    });
}

console.log("Supabase Client initialized successfully.");
