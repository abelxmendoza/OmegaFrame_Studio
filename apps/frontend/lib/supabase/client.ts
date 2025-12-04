import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdycnltygfhduvpprruz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeWNubHR5Z2ZoZHV2cHBycnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzAzNjQsImV4cCI6MjA4MDQ0NjM2NH0.PLor4_ZpETthikHrDt5Q5qdcffyDqvKrkoqNE1Ex3VE'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
} else {
  console.log('✅ Supabase client initialized')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
