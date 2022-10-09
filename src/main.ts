import { setupBoard } from './setupBoard'
import { setupDice } from './setupDice'
import { Game } from './classes/game'
import styles from '../assets/style/main.scss'

setupBoard()
setupDice()
const game = new Game()
export { styles }
