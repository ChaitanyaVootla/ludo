export const gameLogic = {
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

export const WAIT_TIMES = {
    PLAYER_TIMEOUT: 1,
    BOT_DELAY: 600,
    PAWN_MOVE: 350,
    PAWN_MOVE_FAST: 100,
    DICE_RESET_DELAY: 500,
}
