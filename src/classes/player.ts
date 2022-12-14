import * as d3 from 'd3'
import { gameLogic } from '../../constants/game'
import { gullySize, homeSize, cellSize, cellsMap } from '../setupBoard'
import { resetDice, rollDice } from '../setupDice'
import { wait } from '../utils'
import { Game } from './game'

class Player {
    name: string
    pawns: Pawn[]
    game: Game
    kills = 0
    pawnSelectionPromise: Promise<any>
    async playTurn() {
        const diceNumber = await this.waitForDiceRoll()
        await this.ingestDice(diceNumber)
        const isComplete = this.checkComplete()
        if (isComplete) {
        } else if (await this.canPlayAnotherTurn(diceNumber)) {
            resetDice()
            await this.playTurn()
        }
    }
    checkComplete() {
        if (this.pawns.filter(pawn => pawn.hasWon).length === 4) {
            return true
        }
        return false
    }
    async canPlayAnotherTurn(diceNumber: number) {
        const isKill = await this.game.checkKills(this)
        if (isKill) {
            return true
        }
        // return true
        if (diceNumber === 6) {
            return true
        } 
    }
    async waitForDiceRoll(): Promise<number> {
        let diceResolve
        const dicePromise = new Promise((resolve) => diceResolve = resolve) as Promise<number>
        const dice = document.getElementById('dice-container') as HTMLElement
        dice.setAttribute('active', 'true')
        dice.onclick = () => {
            diceResolve(rollDice())
            dice.setAttribute('active', 'false')
        }
        return dicePromise
    }
    async waitForPawnSelection(pawns?: Pawn[]): Promise<Pawn> {
        const affectedPawns: Pawn[] = (pawns || this.pawns)
        affectedPawns.forEach(pawn => pawn.d3.attr('highlight', 'true'))
        const pawn = await Promise.any(affectedPawns.map((pawn: Pawn) => pawn.onClick()))
        affectedPawns.forEach(pawn => pawn.d3.attr('highlight', null))
        return pawn
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
        return this.pawns.filter(pawn => pawn.isHome())
    }
    movablePawns(count: number): Pawn[] {
        return this.pawns.filter(pawn => pawn.canMoveBy(count))
    }
    arePawnsSameCell(pawns: Pawn[]): Boolean {
        return new Set(pawns.map(pawn => pawn.cell)).size === 1
    }
    constructor(name: string, game: Game) {
        this.name = name
        this.game = game
        let homeX: number, homeY: number
        switch(name) {
            case 'green': {
                homeX = 0
                homeY = 0
                break
            }
            case 'blue': {
                homeX = homeSize + gullySize
                homeY = homeSize + gullySize
                break
            }
            case 'red': {
                homeX = homeSize + gullySize
                homeY = 0
                break
            }
            case 'yellow': {
                homeX = 0
                homeY = homeSize + gullySize
                break
            }
        }
        this.pawns = [];
        for (let count = 1; count <= 4; count++) {
            let x,y
            switch (count) {
                case 1: {
                    x = homeX + homeSize/3
                    y = homeY + homeSize/3
                    break
                }
                case 2: {
                    x = homeX + 2 * homeSize/3
                    y = homeY + homeSize/3
                    break
                }
                case 3: {
                    x = homeX + homeSize/3
                    y = homeY + 2*homeSize/3
                    break
                }
                case 4: {
                    x = homeX + 2*homeSize/3
                    y = homeY + 2*homeSize/3
                    break
                }
            }
            const d3Handler = d3.select('svg,.board')
                .append('circle')
                .attr('class', `player ${name} ${count}`)
                .attr('r', cellSize/3)
                .attr('cx', x)
                .attr('cy', y)
            const pawn = new Pawn({
                color: this.name,
                count,
                player: this,
                home: {x, y},
                d3: d3Handler,
            })
            this.pawns.push(pawn)
        }
    }
}

class Pawn {
    color: string
    count: number
    end: number
    cell: number
    player: Player
    hasWon = false
    d3: any
    home: {
        x: number,
        y: number,
    }
    async move(count: number) {
        this.cell = count
        const cellD3 = d3.select(`.cell[${this.color}Cell="${count}"]`)
        this.d3.transition().duration(200).ease(d3.easeLinear)
            .attr('cx', parseInt(cellD3.attr('x')) + cellSize/2)
            .attr('cy', parseInt(cellD3.attr('y')) + cellSize/2)
        await wait(300)
        this.checkSafe()
    }
    checkSafe() {
        if (gameLogic.safeCells.includes(cellsMap[this.color][this.cell])) {
            const pawnX = Number(this.d3.attr('cx'))
            const pawnY = Number(this.d3.attr('cy'))
            const padding = cellSize/4
            const shrunkSize = cellSize/4
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
            this.d3.attr('cx', parseInt(cellD3.attr('x')) + cellSize/2)
                .attr('cy', parseInt(cellD3.attr('y')) + cellSize/2)
                .attr('r', cellSize/3)
        }
    }
    async moveBy(count: number) {
        if (this.cell + count < this.end) {
            for (let i = 0; i < count; i++) {
                this.cell += 1
                const cellD3 = d3.select(`.cell[${this.color}Cell="${this.cell}"]`)
                this.d3.transition().duration(200).ease(d3.easeLinear)
                    .attr('cx', parseInt(cellD3.attr('x')) + cellSize/2)
                    .attr('cy', parseInt(cellD3.attr('y')) + cellSize/2)
                await wait(300)
            }
        } else if (this.cell + count === this.end) {
            this.hasWon = true
            const finishD3 = d3.select(`polygon.finish.${this.color}`)
            const polyCoordinates = finishD3.attr('points').split(' ')
            let x = 0
            let y = 0
            polyCoordinates.forEach(
                coord => {
                    x += parseInt(coord.split(',')[0])
                    y += parseInt(coord.split(',')[1])
                }
            )
            x = x/3
            y = y/3
            this.d3.transition().duration(200).ease(d3.easeLinear)
                .attr('cx', x)
                .attr('cy', y)
            await wait(300)
        }
        this.checkSafe()
    }
    async goHome() {
        for (let i = this.cell; i > 1; i--) {
            this.cell -= 1
            const cellD3 = d3.select(`.cell[${this.color}Cell="${this.cell}"]`)
            this.d3.transition().duration(100).ease(d3.easeLinear)
                .attr('cx', parseInt(cellD3.attr('x')) + cellSize/2)
                .attr('cy', parseInt(cellD3.attr('y')) + cellSize/2)
            await wait(100)
        }
        this.cell = -1
        this.d3.transition().duration(100).ease(d3.easeLinear)
            .attr('cx', this.home.x)
            .attr('cy', this.home.y)
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
        const clickPromise = new Promise((resolve) => clickResolve = resolve) as Promise<Pawn>
        this.d3.on('click', () => clickResolve(this))
        return clickPromise;
    }
    isHome() {
        return this.cell < 0
    }
    constructor({color, count, home, d3, player}) {
        this.color = color
        this.count = count
        this.end = 57
        this.d3 = d3
        this.player = player
        this.home = home
        this.cell = -1
    }
}

export { Player, Pawn }
