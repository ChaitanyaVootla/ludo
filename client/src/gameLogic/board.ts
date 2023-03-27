import { gameLogic } from '@/constants/game'
import { Player } from './player'
import { setupBoard } from './setupBoard'
import { Dice } from './dice'
import { socket } from '@/main'
import { SocketEvents } from '../../../server/common'
import type { Pawn } from './pawn'
import skull from '@/assets/images/skull.svg?raw'

export class Board {
    players: { [key: string]: Player } = {}
    dice: Dice
    clientPlayer: Player
    updateDice(color: string) {
        document.getElementById('dice-container')?.setAttribute('player', color)
    }
    constructor() {
        this.dice = new Dice()
        setupBoard()
        gameLogic.players.forEach((color: string) => {
            const player: Player = new Player(color)
            this.players[player.name] = player
        })

        // TODO
        this.clientPlayer = this.players['green']

        socket.on(SocketEvents.SELECT_PLAYER, (color: string) => {
            this.updateDice(color)
        })
        socket.on(SocketEvents.PAWN_MOVED, ({ color, id, cell }: { color: string; id: number; cell: number }) => {
            const player = this.players[color]
            const pawn = player.pawns.find((pawn) => pawn.id === id) as Pawn
            pawn.move(cell)
        })
        socket.on(SocketEvents.PAWN_HOME, ({ color, id }: { color: string; id: number; }) => {
            const player = this.players[color]
            const pawn = player.pawns.find((pawn) => pawn.id === id) as Pawn
            pawn.goHome()
        })
        socket.on(SocketEvents.PAWN_FINISH, ({ color, id }: { color: string; id: number; }) => {
            const player = this.players[color]
            const pawn = player.pawns.find((pawn) => pawn.id === id) as Pawn
            pawn.moveBy(1)
        })
        socket.on(SocketEvents.SELECT_PAWNS, async (pawns: any, callback) => {
            const player = this.players[pawns[0].color]
            const pawnSelected = await player.waitForPawnSelection(
                player.pawns.filter((pawn: Pawn) => pawns.find(({id}: {id: number}) => pawn.id === id)),
            )
            callback(pawnSelected.id)
        })
        socket.on(SocketEvents.KILL, (killInfo: any) => {
            // document.getElementById(`${player.name}-kills`).insertAdjacentHTML('beforeend',
            //     `<div class="kill ${checkPawn.color}">${skull}</div>`)
            // const killedPlayer = this.players[pawn.color]
            console.log("pushing kill")
            document.getElementById(`${killInfo.killerInfo.color}-kills`)?.insertAdjacentHTML('beforeend',
                `<div class="kill ${killInfo.killedInfo.color}">${skull}</div>`)
        })
    }
}
