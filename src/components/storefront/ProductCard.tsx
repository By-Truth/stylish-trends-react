import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { formatPrice } from '../../lib/format'
import { StarRating } from '../ui/StarRating'

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]
  const discount =
    product.compare_price && Number(product.compare_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
      : null

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft/40">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="4" width="18" height="16" rx="1" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="m21 15-5-5L5 20" />
            </svg>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {!!product.is_new && (
            <span className="bg-ink px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">New</span>
          )}
          {discount && (
            <span className="bg-clay px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">
              -{discount}%
            </span>
          )}
          {product.stock_qty === 0 && (
            <span className="bg-rust px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">
              Sold out
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-ink group-hover:text-clay">{product.name}</p>
        {product.review_count > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating rating={product.avg_rating} size={11} />
            <span className="text-xs text-ink-soft">({product.review_count})</span>
          </div>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display text-base">{formatPrice(product.price)}</span>
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <span className="text-xs text-ink-soft line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
