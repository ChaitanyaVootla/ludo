import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { io } from 'socket.io-client'
import { getUserId, setup, getGameId } from '@/localStorageManager'

import './assets/main.scss'
import './assets/style.less'

setup()
const socket = io('http://localhost:3000')

socket.on('connect', () => {
    const payload = {
        userId: getUserId(),
        gameId: getGameId(),
    }
    console.log("cjecking connection", payload)
    socket.emit(
        'connectionCheck',
        payload,
        (isConnected: boolean) => {
            if (isConnected) {
                console.log("game in progress, reconnecting to game")
                router.push('/game')
            }
        },
    )
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

export { socket }
