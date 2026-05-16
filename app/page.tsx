'use client'

import { ShapeForm } from './components/ShapeForm'
import { ShapeList } from './components/ShapeList'
import { useState } from 'react'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleShapeAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="mx-auto max-w-[1280px] p-8">
      <h1 className="text-2xl font-bold mb-4">Arc Forming Machine</h1>
      
      <div className="mb-8">
        <ShapeForm onShapeAdded={handleShapeAdded} />
      </div>
      
      <ShapeList refreshTrigger={refreshTrigger} />
    </main>
  )
} 