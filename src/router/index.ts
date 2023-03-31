import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: '/balance',
    component: () => import('@/views/Balance.vue'),
  },
  {
    path: '/pnl',
    component: () => import('@/views/Pnl.vue'),
  },
  {
    path: '/transactions',
    component: () => import('@/views/Transactions.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
