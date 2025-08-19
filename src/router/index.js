import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
//import projectOneView from '@/views/project1/main.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //history: createWebHistory(),
  //history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    /*
    {
      path: '/project1',
      name: 'project1',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/project1/main.vue')
    }*/
  ]
})

export default router

