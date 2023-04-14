import { createRouter, createWebHistory } from '@ionic/vue-router'

import routes from './routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  // return false
})

export default router
