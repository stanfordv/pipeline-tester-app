// filepath: app/components/ShapeForm.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ShapeFormProps {
  onShapeAdded?: () => void
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
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('shapes').insert([formData])

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Shape added successfully!')
      setFormData({ sentence: '', src: '', op: '', dest: '', label: '', type: '' })
      onShapeAdded?.()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">Add New Shape</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Sentence Input</label>
        <textarea
          name="sentence"
          value={formData.sentence || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, sentence: e.target.value }))}
          className="w-full p-2 border rounded bg-white text-gray-900 h-24"
          placeholder="Enter a full sentence to parse..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Src</label>
          <input
            name="src"
            value={formData.src}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900"
            placeholder="source"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Op</label>
          <input
            name="op"
            value={formData.op}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900"
            placeholder="operation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dest</label>
          <input
            name="dest"
            value={formData.dest}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900"
            placeholder="destination"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            name="label"
            value={formData.label}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900"
            placeholder="label"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <input
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900"
            placeholder="type"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Shape'}
      </button>

      {message && (
        <p className={message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}>
          {message}
        </p>
      )}
    </form>
  )
}