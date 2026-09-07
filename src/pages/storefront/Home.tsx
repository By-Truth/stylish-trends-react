import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '../../lib/api'
import { ProductCard } from '../../components/storefront/ProductCard'
import { Spinner } from '../../components/ui/Spinner'

const TESTIMONIALS = [
  {
    quote:
      "The quality of the Ankara wrap set exceeded my expectations. It arrived beautifully packaged within 3 days. I've already ordered two more pieces!",
    author: 'Chidinma O.',
    location: 'Lagos',
  },
  {
    quote:
      "Finally a Nigerian fashion brand that delivers on both style and quality. The maxi dress fit perfectly and I got so many compliments at my friend's wedding.",
    author: 'Amaka N.',
    location: 'Abuja',
  },
  {
    quote:
      'Customer service is exceptional! I had a sizing issue and they resolved it immediately via WhatsApp. Will definitely shop here again.',
    author: 'Fatima A.',
    location: 'Port Harcourt',
  },
]

export function Home() {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => productsApi.list({ sort: 'newest', limit: 4 }),
  })
  const { data: bestsellers, isLoading: loadingBest } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => productsApi.list({ sort: 'popular', limit: 4 }),
  })

  return (
    <div>
      {/* HERO */}
      <section
        className="relative flex h-[85vh] min-h-[560px] items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-wide relative text-white">
          <p className="eyebrow text-white/80">New Season Collection</p>
          <h1 className="font-display mt-3 text-5xl font-light leading-[1.05] sm:text-7xl">
            Dress to <em className="italic">Inspire</em>
          </h1>
          <p className="mt-5 max-w-md text-white/85">
            Curated luxury fashion for the modern Nigerian woman. Nationwide delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-clay">
              Shop Collection →
            </Link>
            <Link to="/shop?sort=newest" className="btn-outline border-white text-white hover:bg-white hover:text-ink">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-line bg-sand py-3">
        <div className="flex animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-ink-soft">
          {Array(2)
            .fill([
              'Free Delivery Above ₦50,000',
              'Secure Paystack Payments',
              'New Arrivals Weekly',
              'Order via WhatsApp',
              'Nationwide Delivery in Nigeria',
              'Easy Returns within 7 Days',
            ])
            .flat()
            .map((t, i) => (
              <span key={i}>{t} •</span>
            ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="container-wide py-16">
        <div className="mb-8">
          <p className="eyebrow">Browse By</p>
          <h2 className="section-title">Shop Categories</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(categories?.length ? categories : Array(4).fill(null))
            .slice(0, 4)
            .map((cat: import('../../types').Category | null, i: number) => (
            <Link
              key={cat?.id ?? i}
              to={cat ? `/shop?cat=${cat.slug}` : '/shop'}
              className="group relative flex h-72 items-end overflow-hidden bg-ink p-6"
              style={{
                backgroundImage: `url('/images/product-${(i % 7) + 1}.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/50" />
              <div className="relative text-white">
                <p className="font-display text-2xl">{cat?.name ?? '—'}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/80">
                  {cat ? `${cat.product_count} items` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-wide py-8">
        <div className="mb-8">
          <p className="eyebrow">Just Landed</p>
          <h2 className="section-title">New Arrivals</h2>
        </div>
        {loadingNew ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {newArrivals?.products?.map((p: import('../../types').Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/shop" className="btn-outline">
            View All Products
          </Link>
        </div>
      </section>

      {/* FEATURED BANNER */}
      <section className="bg-ink py-20 text-cream">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-3 gap-2">
            <img src="/images/product-5.jpg" className="h-64 w-full object-cover" alt="" />
            <img src="/images/product-6.jpg" className="col-span-2 h-64 w-full object-cover" alt="" />
          </div>
          <div>
            <p className="eyebrow">Signature Collection</p>
            <h2 className="font-display mt-3 text-4xl font-light leading-tight">The Art of Nigerian Fashion</h2>
            <p className="mt-4 max-w-md text-cream/70">
              At Stylish Trends, we celebrate the richness of Nigerian culture through contemporary fashion — blending
              traditional craftsmanship with modern luxury aesthetics.
            </p>
            <div className="mt-8 flex gap-10">
              <div>
                <p className="font-display text-3xl">500+</p>
                <p className="text-xs uppercase tracking-wider text-cream/60">Happy Customers</p>
              </div>
              <div>
                <p className="font-display text-3xl">150+</p>
                <p className="text-xs uppercase tracking-wider text-cream/60">Curated Styles</p>
              </div>
              <div>
                <p className="font-display text-3xl">36</p>
                <p className="text-xs uppercase tracking-wider text-cream/60">States Delivered</p>
              </div>
            </div>
            <Link to="/about" className="btn-clay mt-8 inline-flex">
              Our Story →
            </Link>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-wide py-16">
        <div className="mb-8">
          <p className="eyebrow">Customer Favourites</p>
          <h2 className="section-title">Bestsellers</h2>
        </div>
        {loadingBest ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {bestsellers?.products?.map((p: import('../../types').Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-sand py-16">
        <div className="container-wide">
          <div className="mb-10 text-center">
            <p className="eyebrow">Customer Stories</p>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="card p-6">
                <p className="text-clay">★★★★★</p>
                <blockquote className="mt-3 text-sm italic text-ink-soft">"{t.quote}"</blockquote>
                <p className="mt-4 text-sm font-semibold">
                  {t.author} <span className="font-normal text-ink-soft">— {t.location}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
