import type { Player } from './player'
import * as d3 from 'd3'
import { cellSize, cellsMap } from './setupBoard'
import { gameLogic } from '@/constants'
import { wait } from './utils'
import moveSound from '@/assets/sounds/move.mp3'


export class Pawn {
    color: string
    id: number
    end: number
    cell: number
    player: Player
    hasWon = false
    d3: any
    home: {
        x: number
        y: number
    }
    async move(count: number) {
        this.cell = count
        const cellD3 = d3.select(`.cell[${this.color}Cell="${count}"]`)
        if (cellD3.empty()) {
            return
        }
        this.d3
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr('cx', parseInt(cellD3.attr('x')) + cellSize / 2)
            .attr('cy', parseInt(cellD3.attr('y')) + cellSize / 2)
        const audio = new Audio(moveSound);
        audio.play();
        await wait(300)
        this.checkSafe()
    }
    checkSafe() {
        if (gameLogic.safeCells.includes(cellsMap[this.color][this.cell])) {
            const pawnX = Number(this.d3.attr('cx'))
            const pawnY = Number(this.d3.attr('cy'))
            const padding = cellSize / 4
            const shrunkSize = cellSize / 4
            switch (this.color) {
                case 'green': {
                    this.d3.attr('r', shrunkSize).attr('cx', pawnX - padding)
                    this.d3.attr('r', shrunkSize).attr('cy', pawnY - padding)
                    break
                }
                case 'red': {
                    this.d3.attr('r', shrunkSize).attr('cx', pawnX + padding)
                    this.d3.attr('r', shrunkSize).attr('cy', pawnY - padding)
                    break
                }
                case 'blue': {
                    this.d3.attr('r', shrunkSize).attr('cx', pawnX + padding)
                    this.d3.attr('r', shrunkSize).attr('cy', pawnY + padding)
                    break
                }
                case 'yellow': {
                    this.d3.attr('r', shrunkSize).attr('cx', pawnX - padding)
                    this.d3.attr('r', shrunkSize).attr('cy', pawnY + padding)
                    break
                }
            }
        } else {
            const cellD3 = d3.select(`.cell[${this.color}Cell="${this.cell}"]`)
            this.d3
                .attr('cx', parseInt(cellD3.attr('x')) + cellSize / 2)
                .attr('cy', parseInt(cellD3.attr('y')) + cellSize / 2)
                .attr('r', cellSize / 3)
        }
    }
    async moveBy(count: number) {
        if (this.cell + count < this.end) {
            for (let i = 0; i < count; i++) {
                this.cell += 1
                const cellD3 = d3.select(`.cell[${this.color}Cell="${this.cell}"]`)
                this.d3
                    .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                    .attr('cx', parseInt(cellD3.attr('x')) + cellSize / 2)
                    .attr('cy', parseInt(cellD3.attr('y')) + cellSize / 2)
                const audio = new Audio(moveSound);
                audio.play();
                await wait(300)
            }
            this.checkSafe()
        } else if (this.cell + count === this.end) {
            this.hasWon = true
            const finishD3 = d3.select(`polygon.finish.${this.color}`)
            const polyCoordinates = finishD3.attr('points').split(' ')
            let x = 0
            let y = 0
            polyCoordinates.forEach((coord) => {
                x += parseInt(coord.split(',')[0])
                y += parseInt(coord.split(',')[1])
            })
            x = x / 3
            y = y / 3
            this.d3.transition().duration(200).ease(d3.easeLinear).attr('cx', x).attr('cy', y)
            const audio = new Audio(moveSound);
            audio.play();
            await wait(300)
        }
    }
    async goHome() {
        for (let i = this.cell; i > 1; i--) {
            this.cell -= 1
            const cellD3 = d3.select(`.cell[${this.color}Cell="${this.cell}"]`)
            this.d3
                .transition()
                .duration(100)
                .ease(d3.easeLinear)
                .attr('cx', parseInt(cellD3.attr('x')) + cellSize / 2)
                .attr('cy', parseInt(cellD3.attr('y')) + cellSize / 2)
            const audio = new Audio(moveSound);
            audio.play();
            await wait(100)
        }
        this.cell = -1
        this.d3.transition().duration(100).ease(d3.easeLinear).attr('cx', this.home.x).attr('cy', this.home.y)
        await wait(100)
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
    async onClick(): Promise<Pawn> {
        let clickResolve: any
        const clickPromise = new Promise((resolve) => (clickResolve = resolve)) as Promise<Pawn>
        this.d3.on('click', () => clickResolve(this))
        return clickPromise
    }
    isHome() {
        return this.cell < 0
    }
    constructor({
        color,
        id,
        home,
        d3,
        player,
    }: {
        color: string
        id: number
        home: {
            x: number
            y: number
        }
        d3: any
        player: Player
    }) {
        this.color = color
        this.id = id
        this.end = 57
        this.d3 = d3
        this.player = player
        this.home = home
        this.cell = -1
    }
}
