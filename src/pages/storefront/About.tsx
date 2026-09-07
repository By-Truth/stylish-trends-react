export function About() {
  return (
    <div>
      <section
        className="flex h-80 items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)), url('/images/product-3.jpg')" }}
      >
        <div className="text-center">
          <p className="eyebrow text-white/80">Our Story</p>
          <h1 className="font-display mt-2 text-5xl font-light">About Stylish Trends</h1>
        </div>
      </section>

      <section className="container-wide grid gap-10 py-16 lg:grid-cols-2">
        <img src="/images/product-1.jpg" className="h-full w-full object-cover" alt="" />
        <div>
          <p className="eyebrow">Who We Are</p>
          <h2 className="section-title mt-2">Rooted in Nigerian Craft</h2>
          <p className="mt-5 text-ink-soft leading-relaxed">
            Stylish Trends began with a simple belief: Nigerian fashion deserves a home that treats it with the
            same care as any global luxury house. We work with local tailors and fabric artisans across Lagos and
            Port Harcourt to bring you pieces that carry real craftsmanship — from hand-selected Ankara wax prints
            to modern silhouettes cut for the way Nigerian women actually move through their day.
          </p>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Every order is packed with care and shipped nationwide, with support available directly on WhatsApp for
            anything from sizing questions to order tracking.
          </p>
        </div>
      </section>

      <section className="bg-ink py-16 text-cream">
        <div className="container-wide grid gap-8 text-center sm:grid-cols-3">
          <div>
            <p className="font-display text-4xl">500+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">Happy Customers</p>
          </div>
          <div>
            <p className="font-display text-4xl">150+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">Curated Styles</p>
          </div>
          <div>
            <p className="font-display text-4xl">36</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">States Delivered</p>
          </div>
        </div>
      </section>
    </div>
  )
}
