import { sendMessageSync } from '@/utils/socket'
import { SocketEvents } from '@common/index'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { WAIT_TIMES } from './constants'
import type { Game } from './index'
import { Pawn } from './pawn'
import { wait } from './utils'

class Player {
    userId!: string
    name: string
    pawns: Pawn[]
    game: Game
    socket!: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    kills = [] as any[]
    pawnSelectionPromise: Promise<any> = undefined as any
    async playTurn() {
        const isComplete = this.hasWon()
        if (isComplete) {
            return
        }
        const diceNumber = await this.waitForDiceRoll()
        await this.ingestDice(diceNumber)
        if (await this.canPlayAnotherTurn(diceNumber)) {
            this.game.dice.resetDice()
            await this.playTurn()
        }
        this.game.gameTick()
    }
    hasWon(): boolean {
        if (this.pawns.filter((pawn) => pawn.hasWon).length === 4) {
            return true
        }
        return false
    }
    async canPlayAnotherTurn(diceNumber: number) {
        const isKill = await this.game.checkKills(this)
        if (isKill) {
            return true
        }
        if (diceNumber === 6) {
            return true
        }
    }
    async waitForDiceRoll(): Promise<number> {
        let diceResolve: any
        const dicePromise = new Promise((resolve) => (diceResolve = resolve)) as Promise<number>
        // TODO: Wait for player to click dice
        diceResolve(this.game.dice.rollDice())
        return dicePromise
    }
    async waitForPawnSelection(pawns: Pawn[]): Promise<Pawn> {
        if (this.socket) {
            let pawnId = await Promise.any([
                sendMessageSync(
                    this.socket,
                    SocketEvents.SELECT_PAWNS,
                    pawns.map(({ id, color }) => ({ id, color })),
                ),
                await wait(WAIT_TIMES.PLAYER_TIMEOUT),
            ])
            if (!pawnId) {
                return pawns[Math.floor(Math.random() * pawns.length)]
            }
            const pawn = this.pawns.find((pawn) => pawn.id === pawnId) as Pawn
            if (!pawn) {
                console.log('pawn not found', pawnId, 'selectable ids:', pawns.map((pawn) => pawn.id))
            }
            return pawn
        } else {
            await wait(WAIT_TIMES.BOT_DELAY)
            return pawns[Math.floor(Math.random() * pawns.length)]
        }
    }
    async ingestDice(diceNumber: number) {
        const pawnsHome = this.pawnsAtHome()
        if (diceNumber === 6) {
            if (pawnsHome.length === 4) {
                await this.pawns[0].move(1)
            } else {
                const pawn: Pawn = await this.waitForPawnSelection(this.movablePawns(diceNumber))
                if (pawn.isHome()) {
                    await pawn.move(1)
                } else {
                    await pawn.moveBy(diceNumber)
                }
            }
        } else {
            if (this.movablePawns(diceNumber).length > 1) {
                if (this.arePawnsSameCell(this.movablePawns(diceNumber))) {
                    await this.movablePawns(diceNumber)[0].moveBy(diceNumber)
                } else {
                    const pawn: Pawn = await this.waitForPawnSelection(this.movablePawns(diceNumber))
                    await pawn.moveBy(diceNumber)
                }
            } else if (this.movablePawns(diceNumber).length === 1) {
                await this.movablePawns(diceNumber)[0].moveBy(diceNumber)
            }
        }
    }
    pawnsAtHome(): Pawn[] {
        return this.pawns.filter((pawn) => pawn.isHome())
    }
    movablePawns(count: number): Pawn[] {
        return this.pawns.filter((pawn) => pawn.canMoveBy(count))
    }
    arePawnsSameCell(pawns: Pawn[]): Boolean {
        return new Set(pawns.map((pawn) => pawn.cell)).size === 1
    }
    constructor(
        name: string,
        game: Game,
        userId?: string,
        socket?: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    ) {
        this.name = name
        if (userId) {
            this.userId = userId
        }
        this.game = game
        if (socket) {
            this.socket = socket
        }
        this.pawns = []
        for (let id = 1; id <= 4; id++) {
            const pawn = new Pawn({
                color: this.name,
                id,
                player: this,
                game: this.game,
            })
            this.pawns.push(pawn)
        }
    }
}

export { Player }
