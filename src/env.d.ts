/// <reference types="@dcloudio/types" />

declare module 'lunar-javascript'

declare module '@dcloudio/vite-plugin-uni' {
  import type { Plugin } from 'vite'

  export default function uni(): Plugin | Plugin[]
}

interface ImportMetaEnv {
  readonly VITE_QWEATHER_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
