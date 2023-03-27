import * as d3 from 'd3'
import { gullySize, homeSize, cellSize } from '@/gameLogic/setupBoard'
import { Pawn } from './pawn'
import { socket } from '@/main'
import { SocketEvents } from '../../../server/common'

export class Player {
    name: string
    pawns: Pawn[]
    kills = 0
    pawnSelectionPromise!: Promise<any>
    // async waitForDiceRoll(): Promise<number> {
    //     let diceResolve: any
    //     const dicePromise = new Promise((resolve) => (diceResolve = resolve)) as Promise<number>
    //     const dice = document.getElementById('dice-container') as HTMLElement
    //     dice.setAttribute('active', 'true')
    //     dice.onclick = () => {
    //         diceResolve(Dice.rollDice())
    //         dice.setAttribute('active', 'false')
    //     }
    //     return dicePromise
    // }
    async waitForPawnSelection(pawns?: Pawn[]): Promise<Pawn> {
        const affectedPawns: Pawn[] = pawns || this.pawns
        affectedPawns.forEach((pawn) => pawn.d3.attr('highlight', 'true'))
        const pawn = await Promise.any(affectedPawns.map((pawn: Pawn) => pawn.onClick()))
        affectedPawns.forEach((pawn) => pawn.d3.attr('highlight', null))
        return pawn
    }
    arePawnsSameCell(pawns: Pawn[]): Boolean {
        return new Set(pawns.map((pawn) => pawn.cell)).size === 1
    }
    constructor(name: string) {
        this.name = name
        let homeX: number = 0
        let homeY: number = 0
        switch (name) {
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
        this.pawns = []
        for (let id = 1; id <= 4; id++) {
            let x, y
            switch (id) {
                case 1: {
                    x = homeX + homeSize / 3
                    y = homeY + homeSize / 3
                    break
                }
                case 2: {
                    x = homeX + (2 * homeSize) / 3
                    y = homeY + homeSize / 3
                    break
                }
                case 3: {
                    x = homeX + homeSize / 3
                    y = homeY + (2 * homeSize) / 3
                    break
                }
                case 4: {
                    x = homeX + (2 * homeSize) / 3
                    y = homeY + (2 * homeSize) / 3
                    break
                }
            }
            const d3Handler = d3
                .select('svg,.board')
                .append('circle')
                .attr('class', `player ${name} ${id}`)
                .attr('r', cellSize / 3)
                .attr('cx', x as number)
                .attr('cy', y as number)
            const pawn = new Pawn({
                color: this.name,
                id,
                player: this,
                home: { x, y } as { x: number; y: number },
                d3: d3Handler,
            })
            this.pawns.push(pawn)
        }
    }
}
