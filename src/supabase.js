import { createClient } from '@supabase/supabase-js'

// ====== BADILISHA HAPA ======
// Supabase → Settings → API Keys → copy "anon / public" key (inaanza eyJ...)
const SUPABASE_URL = 'https://eolsfwhbkoqdfkrcyuxe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHNmd2hia29xZGZrcmN5dXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDY1OTgsImV4cCI6MjA5ODkyMjU5OH0.EOZvz6MxTS-tJVzXSuc9yuUcVYtGLMU9EIfWVtKxBDc'
// ============================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
