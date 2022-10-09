import { gameLogic } from '../../constants/game'
import { Player } from './player'
import { resetDice } from '../setupDice'
import { wait } from '../utils'

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
        document.getElementById('current-player').innerHTML = `Player: ${this.turn.name}`
        document.getElementById('dice-container').setAttribute('player', player.name)
        this.askToPlayTurn()
    }
    async askToPlayTurn() {
        resetDice()
        await this.turn.playTurn()
        await wait(500)
        const nextColor = gameLogic.players[gameLogic.players.indexOf(this.turn.name) + 1 > gameLogic.players.length - 1?
            0: gameLogic.players.indexOf(this.turn.name) + 1]
        this.setCurrentPlayer(this.players[nextColor])
    }
    constructor() {
        gameLogic.players.forEach(
            (color) => {
                const player: Player = new Player(color, this)
                this.players[player.name] = (player)
            }
        )
        this.setCurrentPlayer(this.players['green'])
    }
}

export { Game }
