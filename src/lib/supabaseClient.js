import { createClient } from '@supabase/supabase-js'

// Ces lignes disent à l'application d'aller lire le fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On vérifie que les clés sont bien chargées
if (!supabaseUrl || !supabaseKey) {
  console.error("Attention : Les clés Supabase ne sont pas définies dans le fichier .env")
}

export const supabase = createClient(supabaseUrl, supabaseKey)