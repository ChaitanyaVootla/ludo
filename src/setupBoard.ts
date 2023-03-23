import * as d3 from "d3";
import { gameLogic } from '../constants/game'

const boardSize = 600;
const homeSize = (boardSize * 2) / 5;
const gullySize = (boardSize * 1) / 5;
const cellSize = gullySize/3
const homes = []
const cellsMap = {}
const setupBoard = () => {
    const svg = d3
        .select("game")
        .append("svg")
        .attr("class", "board")
        .attr("width", boardSize)
        .attr("height", boardSize);
    drawHomes(svg)
    stylizeHomes(svg)
    drawFinish(svg)
    drawGullies(svg)
    drawFinalStretches(svg)
    drawSafeCells()
    updateCellsByPlayer()
};

const drawHomes = (svg) => {
    homes.push(svg
      .append("rect")
      .attr("class", 'home')
      .attr("player", 'green')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", homeSize)
      .attr("height", homeSize));

    homes.push(svg
      .append("rect")
      .attr("class", 'home')
      .attr("player", 'red')
      .attr("x", homeSize + gullySize)
      .attr("y", 0)
      .attr("width", homeSize)
      .attr("height", homeSize));

    homes.push(svg
      .append("rect")
      .attr("class", 'home')
      .attr("player", 'yellow')
      .attr("x", 0)
      .attr("y",  boardSize - homeSize)
      .attr("width", homeSize)
      .attr("height", homeSize));

    homes.push(svg
      .append("rect")
      .attr("class", 'home')
      .attr("player", 'blue')
      .attr("x", homeSize + gullySize)
      .attr("y", boardSize - homeSize)
      .attr("width", homeSize)
      .attr("height", homeSize));
}

const stylizeHomes = (svg) => {
    homes.forEach(function (home) {
        const homeX = parseInt(home.attr('x'))
        const homeY = parseInt(home.attr('y'))
        svg.append('rect')
        .attr("class", "home-base")
        .attr("x", homeX + homeSize/5)
        .attr("y", homeY + homeSize/5)
        .attr("rx",'10px')
        .attr('height', homeSize*3/5)
        .attr('width', homeSize*3/5)
    })
}

const drawFinish = (svg) => {
    // green
    svg
        .append('polygon')
        .attr("class", 'finish green')
        .attr('points', `${homeSize},${homeSize} ${homeSize + cellSize*3/2},${homeSize + cellSize*3/2} ${homeSize},${homeSize + gullySize}`)
    // red
    svg
        .append('polygon')
        .attr("class", 'finish red')
        .attr('points', `${homeSize},${homeSize} ${homeSize + cellSize*3/2},${homeSize + cellSize*3/2} ${homeSize + gullySize},${homeSize}`)
    // blue
    svg
        .append('polygon')
        .attr("class", 'finish blue')
        .attr('points', `${homeSize + gullySize},${homeSize + gullySize} ${homeSize + cellSize*3/2},${homeSize + cellSize*3/2} ${homeSize + gullySize},${homeSize}`)
    // yellow
    svg
        .append('polygon')
        .attr("class", 'finish yellow')
        .attr('points', `${homeSize + gullySize},${homeSize + gullySize} ${homeSize + cellSize*3/2},${homeSize + cellSize*3/2} ${homeSize},${homeSize + gullySize}`)
}

const drawGullies = (svg) => {
    let cellTrack = 1;
    // left
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", count * cellSize)
            .attr("y", homeSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // top
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize)
            .attr("y", homeSize - cellSize - count * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // top bridge
    svg
        .append("rect")
        .attr("class", 'cell gully')
        .attr('cell', cellTrack++)
        .attr("x", homeSize + cellSize)
        .attr("y", 0)
        .attr("width", cellSize)
        .attr("height", cellSize);
    // top
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize + 2*cellSize)
            .attr("y", count * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // right
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize + gullySize + count*cellSize)
            .attr("y", homeSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // right bridge
    svg
        .append("rect")
        .attr("class", 'cell gully')
        .attr('cell', cellTrack++)
        .attr("x", boardSize - cellSize)
        .attr("y", homeSize + cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize);
    // right
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", boardSize -cellSize - count*cellSize)
            .attr("y", homeSize + 2*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // bottom
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize + 2*cellSize)
            .attr("y", homeSize + gullySize + count*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // bottom bridge
    svg
        .append("rect")
        .attr("class", 'cell gully')
        .attr('cell', cellTrack++)
        .attr("x", homeSize + cellSize)
        .attr("y", boardSize - cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize);
    // bottom
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize)
            .attr("y", boardSize - cellSize - count*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // left
    for (let count = 0; count < 6; count++) {
        svg
            .append("rect")
            .attr("class", 'cell gully')
            .attr('cell', cellTrack++)
            .attr("x", homeSize - cellSize - count*cellSize)
            .attr("y", homeSize + 2*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // left bridge
    svg
        .append("rect")
        .attr("class", 'cell gully')
        .attr('cell', cellTrack++)
        .attr("x", 0)
        .attr("y", homeSize + cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize);
}

const drawFinalStretches = (svg) => {
    let cellTrack = 1;
    // green
    cellTrack = 1;
    for (let count = 0; count < 5; count++) {
        svg
            .append("rect")
            .attr("class", 'cell green finish')
            .attr('cell', cellTrack++)
            .attr("x", cellSize + count*cellSize)
            .attr("y", homeSize + cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // green
    cellTrack = 1;
    for (let count = 0; count < 5; count++) {
        svg
            .append("rect")
            .attr("class", 'cell red finish')
            .attr('cell', cellTrack++)
            .attr("x", homeSize + cellSize)
            .attr("y", cellSize + count*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // blue
    cellTrack = 1;
    for (let count = 0; count < 5; count++) {
        svg
            .append("rect")
            .attr("class", 'cell blue finish')
            .attr('cell', cellTrack++)
            .attr("x", boardSize - 2*cellSize - count*cellSize)
            .attr("y", homeSize + cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
    // yellow
    cellTrack = 1;
    for (let count = 0; count < 5; count++) {
        svg
            .append("rect")
            .attr("class", 'cell yellow finish')
            .attr('cell', cellTrack++)
            .attr("x", homeSize + cellSize)
            .attr("y", boardSize - 2*cellSize - count*cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize);
    }
}

const updateCellsByPlayer = () => {
    gameLogic.players.forEach(
        player => {
            cellsMap[player] = {}
            let playerTrack = gameLogic.startCell[player]
            let cellCount = 1
            for (let count = 0; count < 51; count++) {
                if (playerTrack > 52) {
                    playerTrack = 1;
                }
                cellsMap[player][cellCount] = playerTrack
                d3.select(`.cell.gully[cell="${playerTrack++}"]`).attr(`${player}Cell`, cellCount++)
                d3.select(`.cell.gully[cell="${cellsMap[player][cellCount]}"]`).attr(`${player}CellMap`, cellCount - 1)
            }
            for (let count = 1; count <= 5; count++) {
                d3.select(`.cell.finish.${player}[cell="${count}"]`).attr(`${player}Cell`, cellCount++)
            }
        }
    )
}

const drawSafeCells = () => {
    gameLogic.safeCells.forEach(
        cell => {
            d3.select(`.gully.cell[cell="${cell}"]`).attr('safe', 'true')
        }
    )
}

export { setupBoard, homeSize, gullySize, cellSize, cellsMap };
