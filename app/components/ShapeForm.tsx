// filepath: app/components/ShapeForm.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ShapeFormProps {
  onShapeAdded?: () => void
}

interface RuleMatch {
  src: string
  op: string
  dest: string
  label: string
  type: string
}

export function ShapeForm({ onShapeAdded }: ShapeFormProps) {
  const [formData, setFormData] = useState({
    sentence: '',
    src: '',
    op: '',
    dest: '',
    label: '',
    type: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [converting, setConverting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleConvert = async () => {
    setConverting(true)
    setStatus(null)

    if (!formData.sentence.trim()) {
      setStatus({ type: 'error', text: 'Enter a sentence to convert.' })
      setConverting(false)
      return
    }

    try {
      const response = await fetch('/api/parse-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: formData.sentence }),
      })
      const data = await response.json()

      if (!data.success) {
        setStatus({ type: 'error', text: data.reason || 'Could not convert sentence.' })
      } else {
        setFormData((prev) => ({ ...prev, ...data.result }))
        setStatus({ type: 'success', text: 'Converted sentence into shape fields.' })
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Conversion failed. Try again or configure AI.' })
    }

    setConverting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const { sentence, ...shapeData } = formData
    const { error } = await supabase.from('shapes').insert([shapeData])

    if (error) {
      setStatus({ type: 'error', text: `Error: ${error.message}` })
    } else {
      setStatus({ type: 'success', text: 'Shape added successfully!' })
      setFormData({ sentence: '', src: '', op: '', dest: '', label: '', type: '' })
      onShapeAdded?.()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-3xl bg-white shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Shape</h2>
          <p className="text-sm text-gray-500">Enter a sentence, convert it into the shape fields, then add the shape.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <label className="block text-sm font-medium mb-2">Sentence</label>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <textarea
            name="sentence"
            value={formData.sentence}
            onChange={(e) => setFormData((prev) => ({ ...prev, sentence: e.target.value }))}
            className="min-h-[8rem] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Enter a full sentence to parse..."
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting}
              className="h-12 w-full rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {converting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div>
          <label className="block text-sm font-medium mb-1">Src</label>
          <input
            name="src"
            value={formData.src}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="source"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Op</label>
          <input
            name="op"
            value={formData.op}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="operation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dest</label>
          <input
            name="dest"
            value={formData.dest}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="destination"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            name="label"
            value={formData.label}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="label"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <input
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="type"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {status ? (
          <p className={status.type === 'error' ? 'text-red-600' : 'text-green-600'}>{status.text}</p>
        ) : (
          <p className="text-sm text-gray-500">Use Convert first to populate fields from the sentence.</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Adding...' : 'Add Shape'}
        </button>
      </div>
    </form>
  )
}