/// <reference types="@dcloudio/types" />

declare module '@dcloudio/vite-plugin-uni' {
  import type { Plugin } from 'vite'

  export default function uni(): Plugin | Plugin[]
}

interface ImportMetaEnv {
  readonly VITE_QWEATHER_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
