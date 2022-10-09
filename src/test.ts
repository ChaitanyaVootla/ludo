import * as d3 from "d3";

const playerSize = 12

const play = () => {
    const player = d3.select('svg.board')
        .append('circle')
        .attr('class', 'player')
        .attr('r', playerSize)
        .attr('cx', 100)
        .attr('cy', 100)
    player.transition().duration(100).ease(d3.easeLinear).attr('cx', 300)
    setTimeout(
        () => {
            player.transition().duration(2000).ease(d3.easeLinear).attr('cx', 500)
        }, 1000
    )
}

export {play}
