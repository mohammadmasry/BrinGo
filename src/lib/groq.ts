import { api } from './api'

export interface DetectedOrder {
  pickup: string
  dropoff: string
  description: string
  size: 'S' | 'M' | 'L'
  slotId?: string            // e.g. "s1416" — pre-selects time slot in step 4
  scheduleDay?: 'today' | 'tomorrow'
}

export interface GroqMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  if (!api.isConfigured) {
    return 'Einkaufszettel-Analyse nicht konfiguriert (Backend fehlt).'
  }
  try {
    const { text } = await api.ai.image({ base64, mimeType })
    return text || 'Keine Elemente erkannt.'
  } catch {
    return 'Verbindungsfehler beim Analysieren des Bildes.'
  }
}

export async function askGroq(
  messages: GroqMessage[]
): Promise<{ text: string; order: DetectedOrder | null }> {
  if (!api.isConfigured) {
    return {
      text: '⚙️ AI assistant not configured yet — set VITE_API_URL and the backend GROQ_API_KEY to activate.',
      order: null,
    }
  }

  try {
    const { text: raw } = await api.ai.chat(messages)

    const orderMatch = raw.match(/\|\|ORDER\|\|\s*(\{[\s\S]*?\})/)
    let order: DetectedOrder | null = null
    if (orderMatch) {
      try {
        const parsed = JSON.parse(orderMatch[1])
        if (parsed.pickup && parsed.dropoff) {
          order = {
            pickup: parsed.pickup,
            dropoff: parsed.dropoff,
            description: parsed.description || '',
            size: (['S', 'M', 'L'] as const).includes(parsed.size) ? parsed.size : 'M',
            slotId: parsed.slotId && parsed.slotId !== 'null' ? parsed.slotId : undefined,
            scheduleDay: parsed.scheduleDay === 'today' || parsed.scheduleDay === 'tomorrow'
              ? parsed.scheduleDay : undefined,
          }
        }
      } catch {}
    }

    const text = raw.replace(/\|\|ORDER\|\|\s*\{[\s\S]*?\}/, '').trim()
    return { text, order }
  } catch {
    return { text: 'Connection error. Please check your internet and try again.', order: null }
  }
}
