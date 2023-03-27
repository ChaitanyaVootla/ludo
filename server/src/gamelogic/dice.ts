import { BroadcastOperator } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { SocketEvents } from '@common/index'

class Dice {
    socket!: BroadcastOperator<DefaultEventsMap, any>
    rollDice(): number {
        const randomNumber = Math.floor(6*Math.random())+1
        this.socket.emit(SocketEvents.DICE_ROLLED, randomNumber)
        return randomNumber
    }

    resetDice() {
        // const dice = document.getElementById('dice-container') as HTMLElement
        // dice.innerHTML = ''
        // dice.insertAdjacentHTML('beforeend', diceFaces[0])
        this.socket.emit(SocketEvents.RESET_DICE)
    }

    constructor(socket: BroadcastOperator<DefaultEventsMap, any>) {
        this.socket = socket
        this.resetDice()
    }
}

// const setupDice = () => {
//     resetDice()
// }

export { Dice }
