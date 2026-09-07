import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '../../lib/api'
import { ProductCard } from '../../components/storefront/ProductCard'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import { formatPrice } from '../../lib/format'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function Shop() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || ''
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'newest'
  const page = parseInt(params.get('page') || '1')

  const [maxPrice, setMaxPrice] = useState(200000)
  const [sizeFilter, setSizeFilter] = useState<string[]>([])

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { data, isLoading } = useQuery({
    queryKey: ['products', { cat, q, sort, page, maxPrice }],
    queryFn: () => productsApi.list({ category: cat || undefined, q: q || undefined, sort, page, max_price: maxPrice, limit: 12 }),
  })

  const products = useMemo(() => {
    let list = data?.products || []
    if (sizeFilter.length) {
      list = list.filter((p: import('../../types').Product) => sizeFilter.some((s) => p.sizes?.includes(s)))
    }
    return list
  }, [data, sizeFilter])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <p className="eyebrow">Shop</p>
        <h1 className="section-title">{cat ? categories?.find((c: any) => c.slug === cat)?.name || 'Shop' : 'All Products'}</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* FILTER SIDEBAR */}
        <aside className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest">Category</p>
            <div className="space-y-2 text-sm">
              <button onClick={() => setParam('cat', '')} className={`block ${!cat ? 'font-semibold text-clay' : 'text-ink-soft'}`}>
                All
              </button>
              {categories?.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setParam('cat', c.slug)}
                  className={`flex w-full justify-between ${cat === c.slug ? 'font-semibold text-clay' : 'text-ink-soft'}`}
                >
                  <span>{c.name}</span>
                  <span>{c.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeFilter((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]))}
                  className={`h-9 w-9 border text-xs ${
                    sizeFilter.includes(s) ? 'border-ink bg-ink text-white' : 'border-line text-ink-soft'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest">
              Max Price: {formatPrice(maxPrice)}
            </p>
            <input
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-clay"
            />
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest">Search</p>
            <input
              type="text"
              defaultValue={q}
              placeholder="Search products…"
              className="input"
              onKeyDown={(e) => e.key === 'Enter' && setParam('q', (e.target as HTMLInputElement).value)}
            />
          </div>
        </aside>

        {/* PRODUCTS */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-ink-soft">{data?.total ?? 0} Products</p>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input w-auto">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          {isLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" subtitle="Try adjusting your filters." />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {products.map((p: import('../../types').Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {data?.total_pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setParam('page', String(n))}
                  className={`h-9 w-9 border text-sm ${n === page ? 'border-ink bg-ink text-white' : 'border-line'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
