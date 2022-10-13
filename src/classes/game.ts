import { gameLogic } from '../../constants/game'
import { Pawn, Player } from './player'
import { resetDice } from '../setupDice'
import { wait } from '../utils'
import { cellsMap } from '../setupBoard'
import skull from '../images/skull.svg?raw'

class Game {
    turn: Player
    diceNumber = 0
    players = {} as Record<string, Player>
    diceRolled = (diceNumber: number) => {
        this.diceNumber = diceNumber
        this.turn.ingestDice(diceNumber)
    }
    setCurrentPlayer(player) {
        this.turn = player
        // document.getElementById('current-player').innerHTML = `Player: ${this.turn.name}`
        document.getElementById('dice-container').setAttribute('player', player.name)
        this.askToPlayTurn()
    }
    async checkKills(player: Player): Promise<Boolean> {
        const players = Object.values(this.players)
        let checkPawn: Pawn
        let isKill = false
        main_loop:
            for (let i = 0; i < 4; i++) {
                const checkPlayer = players[i]
                if (checkPlayer.name === player.name) {
                    continue
                }
                for (let tempCheckPawn of checkPlayer.pawns) {
                    checkPawn = tempCheckPawn
                    for (let pawn of player.pawns) {
                        if ((!checkPawn.isHome() && !pawn.isHome()) &&
                            (!gameLogic.safeCells.includes(cellsMap[checkPlayer.name][checkPawn.cell])) &&
                            (!gameLogic.safeCells.includes(cellsMap[player.name][pawn.cell])) &&
                            (cellsMap[checkPlayer.name][checkPawn.cell] === cellsMap[player.name][pawn.cell])) {
                                console.log(`killer ${player.name} pawn no: ${pawn.count} at ${pawn.cell}, original: ${cellsMap[player.name][pawn.cell]}`)
                                console.log(`killed ${checkPlayer.name} pawn no: ${checkPawn.count} at ${checkPawn.cell}, original: ${cellsMap[checkPlayer.name][checkPawn.cell]}`)
                            isKill = true
                            break main_loop
                        }
                    }
                }
            }
        if (isKill) {
            player.kills += 1
            document.getElementById(`${player.name}-kills`).insertAdjacentHTML('beforeend',
                `<div class="kill ${checkPawn.color}">${skull}</div>`)
            document.getElementById(`${player.name}-kills`).insertAdjacentHTML('beforeend',
                `<div class="kill ${checkPawn.color}">${skull}</div>`)
            document.getElementById(`${player.name}-kills`).insertAdjacentHTML('beforeend',
                `<div class="kill ${checkPawn.color}">${skull}</div>`)
            document.getElementById(`${player.name}-kills`).insertAdjacentHTML('beforeend',
                `<div class="kill ${checkPawn.color}">${skull}</div>`)
            await checkPawn.goHome()
        }
        return isKill
    }
    async askToPlayTurn() {
        resetDice()
        await this.turn.playTurn()
        await wait(300)
        const nextColor = gameLogic.players[gameLogic.players.indexOf(this.turn.name) + 1 > gameLogic.players.length - 1?
            0: gameLogic.players.indexOf(this.turn.name) + 1]
        this.setCurrentPlayer(this.players[nextColor])
    }
    async test() {
        setTimeout((async () => {
            // await this.players['green'].pawns[0].move(1)
            // await this.players['red'].pawns[0].move(40)
            // await this.players['blue'].pawns[0].move(27)
            // await this.players['yellow'].pawns[0].move(14)
            // await this.players['green'].pawns[0].move(2)
            // await this.players['yellow'].pawns[0].move(12)
            // await this.players['yellow'].pawns[0].moveBy(3)
            // await this.checkKills(this.players['yellow'])

            // await this.players['yellow'].pawns[1].move(2)
            // await this.players['blue'].pawns[1].move(12)
            // await this.players['blue'].pawns[1].moveBy(3)
            // this.checkKills(this.players['blue'])

            // await this.players['blue'].pawns[2].move(2)
            // await this.players['red'].pawns[2].move(12)
            // await this.players['red'].pawns[2].moveBy(3)
            // this.checkKills(this.players['red'])

            await this.players['red'].pawns[3].move(2)
            await this.players['green'].pawns[3].move(12)
            await this.players['green'].pawns[3].moveBy(3)
            this.checkKills(this.players['green'])

            // await this.players['yellow'].pawns[1].move(28)
            // await this.players['green'].pawns[2].move(12)
            // await this.players['green'].pawns[2].moveBy(3)
            // this.checkKills(this.players['green'])

            // await this.players['blue'].pawns[1].move(41)
            // await this.players['green'].pawns[1].move(12)
            // await this.players['green'].pawns[1].moveBy(3)
            // this.checkKills(this.players['green'])
        }))
    }
    constructor() {
        gameLogic.players.forEach(
            (color) => {
                const player: Player = new Player(color, this)
                this.players[player.name] = (player)
            }
        )
        this.test()
        this.setCurrentPlayer(this.players['green'])
    }
}

export { Game }
