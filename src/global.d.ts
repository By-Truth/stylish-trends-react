interface PaystackHandler {
  openIframe: () => void
}
interface PaystackPopSetupOptions {
  key: string
  email: string
  amount: number
  currency?: string
  ref?: string
  metadata?: unknown
  callback: (response: { reference: string }) => void
  onClose: () => void
}
interface Window {
  PaystackPop?: {
    setup: (options: PaystackPopSetupOptions) => PaystackHandler
  }
}

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
