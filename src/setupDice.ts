import { diceFaces } from './dice/constants'

const dice = document.getElementById('dice-container') as HTMLElement

const rollDice = (): number => {
    dice.innerHTML = ''
    const randomNumber = Math.floor(6*Math.random())+1
    dice.insertAdjacentHTML('beforeend', diceFaces[randomNumber])
    return randomNumber
}

const resetDice = () => {
    dice.innerHTML = ''
    dice.insertAdjacentHTML('beforeend', diceFaces[0])
}

const setupDice = () => {
    resetDice()
}

export { setupDice, rollDice, resetDice }
