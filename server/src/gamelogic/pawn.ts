import { Player } from './player'
import { wait } from '@/gamelogic/utils'
import { Game } from '.'
import { SocketEvents } from '@common/index'
import { WAIT_TIMES } from './constants'

export class Pawn {
    color: string
    id: number
    end: number
    cell: number
    player: Player
    game: Game
    hasWon = false
    async move(count: number) {
        this.cell = count
        this.sendPawnMoveMessage()
        await wait(WAIT_TIMES.PAWN_MOVE)
    }
    sendPawnMoveMessage() {
        this.game.socket.emit(SocketEvents.PAWN_MOVED, { color: this.color, id: this.id, cell: this.cell })
    }
    sendPawnHomeMessage() {
        this.game.socket.emit(SocketEvents.PAWN_HOME, { color: this.color, id: this.id })
    }
    sendPawnFinishMessage() {
        this.game.socket.emit(SocketEvents.PAWN_FINISH, { color: this.color, id: this.id })
    }
    async moveBy(count: number) {
        if (this.cell + count < this.end) {
            for (let i = 0; i < count; i++) {
                this.cell += 1
                this.sendPawnMoveMessage()
                await wait(WAIT_TIMES.PAWN_MOVE)
            }
        } else if (this.cell + count === this.end) {
            this.hasWon = true
            for (let i = 0; i < count - 1; i++) {
                this.cell += 1
                this.sendPawnMoveMessage()
                await wait(WAIT_TIMES.PAWN_MOVE)
            }
            this.sendPawnFinishMessage()
            await wait(WAIT_TIMES.PAWN_MOVE)
        }
    }
    async goHome() {
        for (let i = this.cell; i > 1; i--) {
            this.cell -= 1
            this.sendPawnMoveMessage()
            await wait(WAIT_TIMES.PAWN_MOVE_FAST)
        }
        this.cell = -1
        this.sendPawnHomeMessage()
        await wait(WAIT_TIMES.PAWN_MOVE_FAST)
    }
    canMoveBy(diceNumber: number) {
        if (this.isHome()) {
            if (diceNumber === 6) {
                return true
            }
            return false
        }
        return this.cell + diceNumber <= this.end
    }
    isHome() {
        return this.cell < 0
    }
    constructor({
        color,
        id,
        player,
        game,
    }: {
        color: string
        id: number
        player: Player
        game: Game
    }) {
        this.game = game
        this.color = color
        this.id = id
        this.end = 57
        this.player = player
        this.cell = -1
    }
}
