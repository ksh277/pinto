import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://qpwdvjlbsilwqrznsqlq.supabase.co'

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwd2R2amxic2lsd3Fyem5zcWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MDA2NDEsImV4cCI6MjA2ODM3NjY0MX0.fgyzHnL6kICr4eP4CGLuSAaHgy8R4KtqN5yMLDXiq7E'

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing')
  throw new Error('Supabase URL and key are required')
}

if (!isValidUrl(supabaseUrl)) {
  console.error('Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key length:', supabaseKey.length)

export const supabase = createClient(supabaseUrl, supabaseKey)
