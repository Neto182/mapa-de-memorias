    import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqqvuarhbnsdlfqcpshz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcXZ1YXJoYm5zZGxmcWNwc2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5OTE0OTAsImV4cCI6MjA2NjU2NzQ5MH0.XTOwdT0chwJhX4dEXJlNNBG9y7cvzGIh1yioKuZhWqs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});