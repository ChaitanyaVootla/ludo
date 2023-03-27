import { diceFaces } from '../constants/dice'
import { socket } from '@/main'
import { SocketEvents } from '../../../server/common'

export class Dice {
    resetDice() {
        const dice = document.getElementById('dice-container') as HTMLElement
        dice.innerHTML = ''
        dice.insertAdjacentHTML('beforeend', diceFaces[0])
    }

    constructor() {
        this.resetDice()
        socket.on(SocketEvents.DICE_ROLLED, (diceNumber: number) => {
            const dice = document.getElementById('dice-container') as HTMLElement
            dice.innerHTML = ''
            dice.insertAdjacentHTML('beforeend', diceFaces[diceNumber])
        })
        socket.on(SocketEvents.RESET_DICE, this.resetDice)
    }
}
