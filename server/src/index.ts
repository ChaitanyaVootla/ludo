import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import cors from 'cors'
import { v4 } from 'uuid'
import { createGame, getAllGames, getGameData, setupDb } from './db'
import { Game } from '@/gamelogic/index'

const games = {} as Record<string, Game>
const app = express()
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
)
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
})

setupDb().then((db) => {
    io.on('connection', (socket) => {
        socket.on('connectionCheck', async (message, callback) => {
            const { userId, gameId } = message
            const gameData = await getGameData(db, gameId)
            if (gameData) {
                socket.join(gameData.id)
                const player = Object.values(games[gameData.id].players).find((player) => player.userId === userId)
                if (player) {
                    player.socket = socket
                }
                callback(true)
            } else {
                callback(false)
            }
        })
        socket.on('createGame', async (message: any, callback) => {
            const gameId = v4()
            const [newDbGame, gamePlayers] = (await createGame(db, gameId, message)) as any
            socket.join(newDbGame.id)
            const newGame: Game = new Game(db, newDbGame, gamePlayers, io.to(newDbGame.id), [socket])
            games[newGame.dbGame.id] = newGame
            callback({
                ...newDbGame,
                players: gamePlayers,
            })
        })
        socket.on('getGameData', async (gameId: string, callback) => {
            const gameData = await getGameData(db, gameId)
            callback(gameData)
        })
    })
})

server.listen(3000, () => {
    console.log('listening on port 3000')
})
