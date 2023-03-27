import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import NewGame from '../views/NewGame.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/newgame',
      name: 'newgame',
      component: NewGame
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
  ]
})

export default router
