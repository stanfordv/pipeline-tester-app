import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

interface RuleMatch {
  src: string
  op: string
  dest: string
  label: string
  type: string
}

function localFallbackParse(sentence: string): { success: boolean; result?: RuleMatch; reason?: string } {
  const trimmed = sentence.trim()
  if (!trimmed) return { success: false, reason: 'Enter a sentence first.' }

  const rules: Array<{
    regex: RegExp
    extract: (match: RegExpMatchArray | null) => RuleMatch
  }> = [
    {
      regex: /^([^\|]+?)\s+(to|->|→|into|from|into the|into a|into an)\s+([^\|]+?)(?:\s+as\s+([^\|]+))?(?:\s+type\s+(.+))?$/i,
      extract: (match) => ({
        src: match?.[1]?.trim() ?? '',
        op: match?.[2]?.trim() ?? '',
        dest: match?.[3]?.trim() ?? '',
        label: match?.[4]?.trim() ?? '',
        type: match?.[5]?.trim() ?? '',
      }),
    },
    {
      regex: /^(.+?)\s+flows?\s+(to|into|toward)\s+(.+?)(?:\s+labelled\s+(.+?))?(?:\s+as\s+a\s+(.+))?$/i,
      extract: (match) => ({
        src: match?.[1]?.trim() ?? '',
        op: match?.[2]?.trim() ?? '',
        dest: match?.[3]?.trim() ?? '',
        label: match?.[4]?.trim() ?? '',
        type: match?.[5]?.trim() ?? '',
      }),
    },
  ]

  for (const rule of rules) {
    const match = trimmed.match(rule.regex)
    if (match) {
      const result = rule.extract(match)
      if (result.src || result.op || result.dest || result.label || result.type) {
        return { success: true, result }
      }
    }
  }

  return { success: false, reason: 'No local rule matched. Please refine the sentence or add rules.' }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const sentence = typeof body?.sentence === 'string' ? body.sentence.trim() : ''

  if (!sentence) {
    return NextResponse.json({ success: false, reason: 'Sentence is required.' }, { status: 400 })
  }

  if (!OPENAI_API_KEY && !CLAUDE_API_KEY) {
    const fallback = localFallbackParse(sentence)
    return NextResponse.json(fallback)
  }

  try {
    const prompt = `Parse the following sentence into a JSON object with keys: src, op, dest, label, type. Only return valid JSON. If you can't parse it, return a JSON object with success false and a reason. Example:\n{\"success\":true,\"result\":{\"src\":\"the cat\",\"op\":\"walks\",\"dest\":\"the man\",\"label\":\"walking\",\"type\":\"action\"}}\nSentence: ${sentence}`
    const useClaude = Boolean(CLAUDE_API_KEY)

    const endpoint = useClaude
      ? 'https://api.anthropic.com/v1/messages'
      : 'https://api.openai.com/v1/chat/completions'
    const headers = useClaude
      ? {
          'Content-Type': 'application/json',
          'X-API-Key': CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01',
        }
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        }

    const body = useClaude
      ? JSON.stringify({
          model: 'claude-3.5',
          system: 'You are a parser that converts English sentences into structured shape fields.',
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: 0.0,
          max_tokens: 300,
        })
      : JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a parser that converts English sentences into structured shape fields.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.0,
          max_tokens: 300,
        })

    const response = await fetch(endpoint, {
      method: 'POST',
      heade rs,
      body,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error')
      return NextResponse.json({ success: false, reason: `AI request failed: ${response.status} ${response.statusText} - ${errorText}` }, { status: 502 })
    }

    const data = await response.json().catch(() => null)
    const content = useClaude ? data?.completion ?? data?.messages?.[0]?.content : data?.choices?.[0]?.message?.content

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ success: false, reason: 'AI response was empty.' }, { status: 502 })
    }

    const trimmedContent = content.trim()
    let parsed
    try {
      parsed = JSON.parse(trimmedContent)
    } catch (error) {
      return NextResponse.json({ success: false, reason: 'AI returned invalid JSON.' }, { status: 502 })
    }

    if (!parsed.success) {
      return NextResponse.json({ success: false, reason: parsed.reason ?? 'AI could not parse the sentence.' })
    }

    return NextResponse.json({ success: true, result: parsed.result })
  } catch (error) {
    return NextResponse.json({ success: false, reason: 'AI request failed. Fallback to local parser if available.' }, { status: 500 })
  }
}
