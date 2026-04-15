import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useAppStore } from '@/store/app'
import { useHomeStore } from '@/store/home'
import './styles/reset.scss'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  useAppStore(pinia).hydrate()
  const homeStore = useHomeStore(pinia)
  void homeStore.hydrate()
  void homeStore.refreshLiveData()

  return {
    app,
    pinia,
  }
}
