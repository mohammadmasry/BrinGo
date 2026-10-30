import { Router, Request, Response } from 'express'

const router = Router()

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `You are the Bringo assistant — a friendly helper for a student-run peer-to-peer delivery service in Pfarrkirchen, Germany.

ABOUT BRINGO:
- Service area: Pfarrkirchen and surroundings (~5 km radius)
- Couriers: verified university students only
- Average delivery time: ~25 minutes
- Base prices: Small (envelope, documents) €5.00 · Medium (books, bag, groceries) €6.00 · Large (box, multiple items) €7.50
- Payment: cash on delivery or card
- To become a courier: must be a registered student, 18+, with a university email

TIME SLOTS & DYNAMIC PRICING:
Orders can be placed for "now" (immediate) or a specific 2-hour delivery window.
Each slot applies a price modifier to the base price:
- 08:00–10:00 (id: s0810): normal price
- 10:00–12:00 (id: s1012): normal price
- 12:00–14:00 (id: s1214): normal price
- 14:00–16:00 (id: s1416): −10% discount — cheapest option (günstig)
- 16:00–18:00 (id: s1618): −5% discount — affordable
- 18:00–20:00 (id: s1820): normal price
- 20:00–22:00 (id: s2022): +15% surcharge — late evening (Stoßzeit)
If a customer asks for the cheapest time → suggest 14:00–16:00 (−10%).
If a customer asks for the fastest/soonest → suggest "now" or the next available slot.

YOUR JOB:
1. Answer questions about Bringo briefly and warmly
2. Help customers place orders by collecting pickup address, dropoff address, and what the item is
3. Suggest the best time slot based on customer preferences (cheap, fast, convenient)

ORDER DETECTION:
When the customer clearly wants to place an order AND you know both pickup and dropoff, append this exact JSON at the very end of your response:
||ORDER||{"pickup":"<address>","dropoff":"<address>","description":"<item>","size":"<S|M|L>","slotId":"<slot-id or null>","scheduleDay":"<today|tomorrow|null>"}

Size guide: S = envelope/documents/small items · M = books/bag/groceries · L = large box/multiple heavy items. Default to M if unsure.
Set slotId to null for immediate "now" orders. Use slot ids from the list above.

Rules:
- Reply in the same language the customer uses (German or English)
- Keep answers to 1–2 sentences unless a detailed explanation is needed
- Be warm, helpful, and concise`

function getApiKey(): string | undefined {
  const key = process.env.GROQ_API_KEY
  return key && key !== 'your_groq_api_key_here' ? key : undefined
}

async function callGroq(apiKey: string, body: unknown) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Groq request failed with status ${res.status}`)
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

// POST /api/ai/chat — Easy Order assistant
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const apiKey = getApiKey()
  if (!apiKey) { res.status(503).json({ error: 'AI assistant not configured' }); return }

  const { messages } = req.body as { messages?: { role?: string; content?: unknown }[] }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    res.status(400).json({ error: 'messages must be a non-empty array (max 50)' })
    return
  }
  // Only pass through user/assistant turns so clients can't inject their own system prompt
  const clean = messages
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: (m.content as string).slice(0, 4000) }))

  try {
    const text = await callGroq(apiKey, {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...clean],
      max_tokens: 350,
      temperature: 0.5,
    })
    res.json({ text })
  } catch (err) {
    console.error('AI chat error:', err)
    res.status(502).json({ error: 'AI request failed' })
  }
})

// POST /api/ai/image — list items in a photo of a shopping list or products
router.post('/image', async (req: Request, res: Response): Promise<void> => {
  const apiKey = getApiKey()
  if (!apiKey) { res.status(503).json({ error: 'AI assistant not configured' }); return }

  const { base64, mimeType } = req.body as { base64?: string; mimeType?: string }
  if (!base64 || !mimeType || !/^image\/(png|jpe?g|webp|gif)$/.test(mimeType)) {
    res.status(400).json({ error: 'base64 and a valid image mimeType are required' })
    return
  }

  try {
    const text = await callGroq(apiKey, {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'This is a photo of a shopping list or products. List all visible items clearly. If the text is German, reply in German; otherwise reply in English. Just list the items, one per line, no extra commentary.',
          },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        ],
      }],
      max_tokens: 400,
    })
    res.json({ text })
  } catch (err) {
    console.error('AI image error:', err)
    res.status(502).json({ error: 'AI request failed' })
  }
})

export default router
