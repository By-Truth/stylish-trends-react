import { useState } from 'react'
import { usePublicSettings } from '../../lib/usePublicSettings'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Lagos: 1-2 days. Other states: 2-7 days depending on location.' },
  { q: 'What is your return policy?', a: 'Easy returns within 7 days of delivery, provided the item is unworn with tags attached.' },
  { q: 'Do you ship nationwide?', a: 'Yes — we deliver to all 36 states plus the FCT.' },
]

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const { data: settings } = usePublicSettings()

  // There's no contact-form endpoint in the API, so this opens a
  // pre-filled WhatsApp chat — a real, working channel rather than a
  // form that silently goes nowhere.
  function sendViaWhatsApp() {
    const msg = `Hi Stylish Trends!\n\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    window.open(`https://wa.me/${settings?.whatsapp?.number || '2348000000000'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="container-wide py-16">
      <div className="mb-10 text-center">
        <p className="eyebrow">Get In Touch</p>
        <h1 className="section-title">Contact Us</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm text-ink-soft">
            Have a question about an order, sizing, or anything else? Send us a message and we'll respond via
            WhatsApp within 24 hours.
          </p>
          <div className="space-y-4">
            <input className="input" placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="input" placeholder="Your Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <textarea className="input" rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            <button
              onClick={sendViaWhatsApp}
              disabled={!form.name || !form.message}
              className="btn-clay w-full disabled:opacity-40"
            >
              Send via WhatsApp
            </button>
          </div>

          <div className="mt-8 space-y-2 text-sm text-ink-soft">
            <p>📍 Lagos & Port Harcourt, Nigeria</p>
            <p>📞 +234 800 000 0000</p>
            <p>✉️ hello@stylishtrends.ng</p>
            <p>🕐 Mon–Sat: 9am – 6pm WAT</p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest">Frequently Asked Questions</p>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4">
                <p className="text-sm font-semibold">{f.q}</p>
                <p className="mt-1 text-sm text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
