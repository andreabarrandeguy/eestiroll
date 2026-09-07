import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// AsyncStorage's web implementation reads `window` eagerly, which crashes
// Expo Router's static/SSR render pass (runs in Node — no `window` there).
// Native never hits this (no `window` global either, but Platform.OS isn't
// 'web'), and the real browser client re-hydrates from AsyncStorage normally.
const isWebSSR = Platform.OS === 'web' && typeof window === 'undefined'

const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWebSSR ? noopStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
    flowType: 'pkce',
  },
})
