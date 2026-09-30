import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export type ProjectDetailsRow = {
  id: number
  slug: string
  title: string
  tagline: string | null
  stack: string[]
  repo_path: string | null
  created_at: string
  updated_at: string
}

export const supabase = createClient(url, anonKey)
