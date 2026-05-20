import { createRouter, createWebHistory } from 'vue-router'

import DesktopView from '../ui/views/DesktopView.vue'

const routes = [
  { path: '/', name: 'desktop', component: DesktopView },
  { path: '/app/:appKey', name: 'app', component: DesktopView },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
