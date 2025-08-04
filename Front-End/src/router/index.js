import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Users from '../views/Users.vue'
import Purchase from '../views/Purchase.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Users,
    },
    {
      path: '/compras',
      name: 'compras',
      component: Purchase,
    },
  ],
})

export default router
