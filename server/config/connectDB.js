// Supabase does not require an explicit connection call.
// The client is initialized in supabaseClient.js and ready on import.
// This file is kept for backward compatibility but does nothing.
const connectDB = () => {
  console.log('✅ Supabase client initialized (no connection step needed)');
};

export default connectDB;