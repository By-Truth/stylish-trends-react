import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productsApi, reviewsApi } from '../../lib/api'
import { formatPrice, formatDate } from '../../lib/format'
import { StarRating } from '../../components/ui/StarRating'
import { Spinner } from '../../components/ui/Spinner'
import { useCartStore } from '../../store/cart'
import { useAuthStore } from '../../store/auth'

export function ProductDetail() {
  const { id } = useParams()
  const productId = parseInt(id!)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '', author_name: '' })

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId),
    enabled: !!productId,
  })
  const { data: reviewData } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.list(productId),
    enabled: !!productId,
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        product_id: productId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.body,
        author_name: reviewForm.author_name || user?.name,
      }),
    onSuccess: (res) => {
      toast.success(res.message)
      setReviewForm({ rating: 5, title: '', body: '', author_name: '' })
      qc.invalidateQueries({ queryKey: ['reviews', productId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Spinner />
  if (!product) return <div className="container-wide py-20 text-center">Product not found.</div>

  function handleAddToCart() {
    if (!size) return toast.error('Please select a size')
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || '',
      qty,
      size,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="container-wide py-10">
      <div className="mb-6 text-xs text-ink-soft">
        <Link to="/shop" className="hover:text-clay">Shop</Link> / {product.name}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* GALLERY */}
        <div>
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-sand">
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name} className="h-full w-full object-cover object-top" />
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink-soft/30">
                <rect x="3" y="4" width="18" height="16" rx="1" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m21 15-5-5L5 20" />
              </svg>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden border ${activeImg === i ? 'border-ink' : 'border-line'}`}
                >
                  <img src={img} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <p className="eyebrow">{product.category_name}</p>
          <h1 className="font-display mt-2 text-3xl font-light">{product.name}</h1>
          {product.review_count > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.avg_rating} />
              <span className="text-sm text-ink-soft">({product.review_count} reviews)</span>
            </div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-2xl">{formatPrice(product.price)}</span>
            {product.compare_price && Number(product.compare_price) > Number(product.price) && (
              <span className="text-ink-soft line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>
          <p className="mt-4 text-sm text-ink-soft">{product.short_desc}</p>

          {product.colours?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest">Colour</p>
              <div className="flex gap-2">
                {product.colours.map((c: { name: string; hex: string }) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="h-7 w-7 rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-10 w-12 border text-sm ${size === s ? 'border-ink bg-ink text-white' : 'border-line'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11">−</button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-11 w-11">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock_qty === 0} className="btn-primary flex-1">
              {product.stock_qty === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
          {product.stock_qty > 0 && product.stock_qty <= 3 && (
            <p className="mt-2 text-xs text-rust">Only {product.stock_qty} left in stock</p>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mt-16 border-t border-line pt-8">
        <div className="mb-6 flex gap-8 border-b border-line">
          {(['desc', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-xs font-bold uppercase tracking-widest ${
                tab === t ? 'border-b-2 border-ink text-ink' : 'text-ink-soft'
              }`}
            >
              {t === 'desc' ? 'Description' : `Reviews (${reviewData?.total ?? 0})`}
            </button>
          ))}
        </div>

        {tab === 'desc' ? (
          <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink-soft">{product.description}</p>
        ) : (
          <div className="max-w-2xl space-y-8">
            {reviewData?.reviews?.length ? (
              <div className="space-y-6">
                {reviewData.reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-line pb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{r.author_name}</p>
                      <p className="text-xs text-ink-soft">{formatDate(r.created_at)}</p>
                    </div>
                    <StarRating rating={r.rating} />
                    {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                    <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">No reviews yet. Be the first to review this product.</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!reviewForm.body.trim()) return toast.error('Please write a review')
                reviewMutation.mutate()
              }}
              className="space-y-4 border-t border-line pt-6"
            >
              <p className="text-sm font-semibold">Write a review</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className="text-xl"
                    style={{ color: n <= reviewForm.rating ? '#a8542b' : '#e4dccb' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {!user && (
                <input
                  className="input"
                  placeholder="Your name"
                  value={reviewForm.author_name}
                  onChange={(e) => setReviewForm((f) => ({ ...f, author_name: e.target.value }))}
                />
              )}
              <input
                className="input"
                placeholder="Review title (optional)"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Share your experience with this product"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
              />
              <button disabled={reviewMutation.isPending} className="btn-outline">
                {reviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
