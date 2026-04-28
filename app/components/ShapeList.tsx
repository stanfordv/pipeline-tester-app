// filepath: app/components/ShapeList.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Shape {
  id: number
  created_at: string
  src: string | null
  op: string | null
  dest: string | null
  label: string | null
  type: string | null
}

interface ShapeListProps {
  refreshTrigger?: number
}

export function ShapeList({ refreshTrigger }: ShapeListProps) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const fetchShapes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('shapes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setShapes(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchShapes()
  }, [fetchShapes, refreshTrigger])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Existing Shapes</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : shapes.length === 0 ? (
        <p className="text-gray-500">No shapes yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {shapes.map((shape) => (
            <li key={shape.id} className="p-4 border rounded bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{shape.label || shape.type || `Shape #${shape.id}`}</h3>
                  <p className="text-gray-600">
                    {shape.src} → {shape.dest}
                  </p>
                  <p className="text-sm text-gray-500">{shape.op}</p>
                </div>
                <span className="text-xs text-gray-400">#{shape.id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}