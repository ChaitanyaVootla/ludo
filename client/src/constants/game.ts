const gameLogic = {
    startCell: {
        green: 2,
        red: 15,
        blue: 28,
        yellow: 41,
    },
    endCell: {
        green: 52,
        red: 13,
        blue: 26,
        yellow: 39,
    },
    players: [
        'green',
        'red',
        'blue',
        'yellow',
    ],
    safeCells: [
        10, 49, 23, 36, 41, 2, 15, 28,
    ]
} as any

export { gameLogic }
