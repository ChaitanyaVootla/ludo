import { gameLogic, WAIT_TIMES } from '@/gamelogic/constants'
import { Player } from './player'
import { Pawn } from './pawn'
import { Dice } from '@/gamelogic/dice'
import { wait } from '@/gamelogic/utils'
import { BroadcastOperator, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { SocketEvents } from '@common/index'
import { DB, updateGameSnapshot } from '@/db'

class Game {
    turn!: Player
    db: DB
    diceNumber = 0
    socket: BroadcastOperator<DefaultEventsMap, any>
    playerSockets: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>[]
    dbGame: any
    players = {} as Record<string, Player>
    dice: Dice
    cellsMap = {} as Record<string, Record<number, number>>
    // diceRolled = (diceNumber: number) => {
    //     this.diceNumber = diceNumber
    //     this.turn.ingestDice(diceNumber)
    // }
    storeSnapshot() {
        const players = Object.values(this.players)
        const snapshot = {
            players: players.map((player) => ({
                name: player.name,
                kills: player.kills,
                pawns: player.pawns.map((pawn) => ({
                    id: pawn.id,
                    color: pawn.color,
                    cell: pawn.cell,
                    isHome: pawn.isHome(),
                    hasWon: pawn.hasWon,
                })),
            })),
        }
        updateGameSnapshot(this.db, this.dbGame.id, JSON.stringify(snapshot))
    }
    gameTick() {
        this.storeSnapshot()
    }
    setCurrentPlayer(player: Player) {
        this.turn = player
        this.socket.emit(SocketEvents.SELECT_PLAYER, player.name)
        this.askToPlayTurn()
    }
    async checkKills(killerPlayer: Player): Promise<Boolean> {
        const players = Object.values(this.players)
        let killedPawn: Pawn | null = null
        let isKill = false
        kill_check_loop: for (const preyPlayer of players) {
            if (preyPlayer.name === killerPlayer.name) {
                continue
            }
            for (let tempCheckPawn of preyPlayer.pawns) {
                killedPawn = tempCheckPawn
                for (let killerPawn of killerPlayer.pawns) {
                    if (
                        !killedPawn.isHome() &&
                        !killerPawn.isHome() &&
                        !gameLogic.safeCells.includes(this.cellsMap[preyPlayer.name][killedPawn.cell]) &&
                        !gameLogic.safeCells.includes(this.cellsMap[killerPlayer.name][killerPawn.cell]) &&
                        !isNaN(this.cellsMap[preyPlayer.name][killedPawn.cell]) &&
                        !isNaN(this.cellsMap[killerPlayer.name][killerPawn.cell]) &&
                        this.cellsMap[preyPlayer.name][killedPawn.cell] === this.cellsMap[killerPlayer.name][killerPawn.cell]
                    ) {
                        isKill = true
                        break kill_check_loop
                    }
                }
            }
        }
        if (isKill && killedPawn) {
            const killInfo = {
                killedInfo: {
                    color: killedPawn.color,
                    cell: killedPawn.cell,
                },
                killerInfo: {
                    color: killerPlayer.name,
                }
            }
            killerPlayer.kills.push(killInfo.killedInfo)
            console.log("emitting kill")
            this.socket.emit(SocketEvents.KILL, killInfo)
            await killedPawn.goHome()
        }
        return isKill
    }
    async askToPlayTurn() {
        if (this.isGameComplete()) {
            return
        }
        this.dice.resetDice()
        await this.turn.playTurn()
        await wait(WAIT_TIMES.DICE_RESET_DELAY)
        const players = Object.values(this.players)
        const nextPlayer =
            players[
                Object.keys(this.players).indexOf(this.turn.name) + 1 > Object.keys(this.players).length - 1
                    ? 0
                    : Object.keys(this.players).indexOf(this.turn.name) + 1
            ]
        this.setCurrentPlayer(this.players[nextPlayer.name])
    }
    isGameComplete() {
        const players = Object.values(this.players)
        for (const player of players) {
            if (!player.hasWon()) {
                return false
            }
        }
        return true
    }
    async test() {
        // kill a pawn
        await this.players['green'].pawns[0].move(1)
        await this.players['red'].pawns[0].move(40)
        await this.players['blue'].pawns[0].move(27)
        await this.players['green'].pawns[0].move(2)
        await this.players['yellow'].pawns[0].move(12)
        await this.players['yellow'].pawns[0].moveBy(3)
        await this.checkKills(this.players['yellow'])

        // finish line
        // await this.players['yellow'].pawns[0].move(54)
        // await this.players['yellow'].pawns[0].moveBy(3)
    }
    constructor(
        db: DB,
        dbGame: any,
        gamePlayers: any[],
        socket: BroadcastOperator<DefaultEventsMap, any>,
        playerSockets: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>[],
    ) {
        this.socket = socket
        this.db = db
        this.playerSockets = playerSockets
        this.dbGame = dbGame
        this.dice = new Dice(socket)

        gameLogic.players.forEach((player: string) => {
            this.cellsMap[player] = {}
            let playerTrack = gameLogic.startCell[player]
            let cellCount = 1
            for (let count = 0; count < 51; count++) {
                if (playerTrack > 52) {
                    playerTrack = 1
                }
                this.cellsMap[player][cellCount] = playerTrack
                cellCount += 1
                playerTrack += 1
            }
        })
        for (let playerCount = 0; playerCount < gamePlayers.length; playerCount++) {
            const gamePlayer = gamePlayers[playerCount]
            const playerObj: Player = new Player(gamePlayer.color, this, gamePlayer.playerId, this.playerSockets[playerCount])
            this.players[playerObj.name] = playerObj
        }
        gameLogic.players.forEach((color: string) => {
            if (this.players[color]) {
                return
            }
            const player: Player = new Player(color, this)
            this.players[player.name] = player
        })
        this.test()
        // this.setCurrentPlayer(this.players['green'])
    }
}

export { Game }
