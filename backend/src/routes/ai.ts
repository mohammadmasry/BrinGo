import { Router, Request, Response } from 'express'

const router = Router()

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `You are the Bringo assistant — a friendly helper for a student-run peer-to-peer delivery service in Pfarrkirchen, Germany.

ABOUT BRINGO:
- Service area: Pfarrkirchen (84347) and Postmünster (84389) only. Politely say we don't deliver to other towns yet.
- Main customers: older people and anyone without a car; relatives can order for them
- Couriers: verified university students, employed as Minijobbers and paid by the hour
- Payment: cash on delivery or card

SHOPPING ROUNDS & PRICES:
- Shopping rounds: every Tuesday and Friday, 09:00–12:00. One courier shops for several customers in one round, which keeps it cheap.
- Order deadline: 20:00 the evening before the round.
- Price in a round: €8.50 per order (shopping or delivery), no extra charges for more stores or bigger packages.
- Urgent: a dedicated trip within about 45 minutes for €15.00.
If a customer asks for the cheapest option → suggest the next shopping round.
If they need it today or right now → offer urgent (€15).

YOUR JOB:
1. Answer questions about Bringo briefly and warmly
2. Help customers place orders by collecting pickup address, dropoff address, and what the item is
3. Suggest the best time slot based on customer preferences (cheap, fast, convenient)

ORDER DETECTION:
When the customer clearly wants to place an order AND you know both pickup and dropoff, append this exact JSON at the very end of your response:
||ORDER||{"pickup":"<address>","dropoff":"<address>","description":"<item>","size":"<S|M|L>","slotId":"<tue|fri|urgent>"}

Size guide: S = envelope/documents/small items · M = books/bag/groceries · L = large box/multiple heavy items. Default to M if unsure.
slotId: "tue" or "fri" for the shopping round the customer wants, "urgent" if they need it right away. If unclear, use the next round.

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
