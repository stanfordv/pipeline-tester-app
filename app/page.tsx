import { createClient } from './utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pipeline Tester</h1>
      <ul className="space-y-2">
        {products?.map((product) => (
          <li key={product.id} className="p-4 border rounded">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
} 