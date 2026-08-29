// src/lib/api.ts
import { supabase } from './Supabase'

const API_URL = import.meta.env.VITE_API_URL

export async function apiPost(path: string, formData: FormData) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Kamu harus login dengan Google dulu')
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      // JANGAN set Content-Type manual — browser otomatis set boundary yang benar untuk FormData
    },
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.detail || 'Terjadi kesalahan, coba lagi')
  }
  return json
}