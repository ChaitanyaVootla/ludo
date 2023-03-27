<script lang="ts">
import { Board } from '@/gameLogic/board';
import type { Pawn } from '@/gameLogic/pawn';
import { getGameId, getUserId } from '@/localStorageManager';
import { sendMessageSync } from '@/socket';

export default {
    name: 'GameView',
    data() {
        return {
            gameData: {} as any,
            board: {} as Board
        }
    },
    mounted() {
        this.board = new Board()
        this.setupGame()
    },
    methods: {
        async setupGame() {
            await this.getGameInfo()
            const playersPositions = this.gameData.snapshot.players
            playersPositions.forEach((playerSnapshot: any) => {
                this.board.players[playerSnapshot.name].pawns.forEach((pawn: Pawn) => {
                    const pawnSnapshot = playerSnapshot.pawns.find((pawnSnapshot: any) => pawnSnapshot.id === pawn.id)
                    pawn.move(pawnSnapshot.cell)
                })
            })
        },
        async getGameInfo() {
            const gameData = await sendMessageSync('getGameData', getGameId());
            if (!gameData) {
                this.$router.push('/')
                return
            }
            this.gameData = {...gameData}
            console.log("gameData", gameData)
        },
        playerName(color: string) {
            if (!this.gameData?.players) return
            const player = this.gameData?.players.find((player: any) => player.color === color)
            return player?.name || 'Bot'
        }
    },
    computed: {
        currentPlayer() {
            if (!this.gameData?.players) return
            return this.gameData?.players.find((player: any) => player.playerId === getUserId())
        }
    }
}
</script>

<template>
    <div>
        <div class="game-surface">
            <div class="side-surface left-surface">
                <div class="player-surface green-surface">
                    <div class="player-name">{{ playerName('green') }}</div>
                    <div id="green-kills" class="kills-container"></div>
                </div>
                <div class="player-surface yellow-surface">
                    <div class="player-name">{{ playerName('yellow') }}</div>
                    <div id="yellow-kills" class="kills-container"></div>
                </div>
            </div>
            <game></game>
            <div class="side-surface right-surface">
                <div class="player-surface red-surface">
                    <div class="player-name">{{ playerName('red') }}</div>
                    <div id="red-kills" class="kills-container"></div>
                </div>
                <div class="player-surface blue-surface">
                    <div class="player-name">{{ playerName('blue') }}</div>
                    <div id="blue-kills" class="kills-container"></div>
                </div>
            </div>
        </div>
        <dice>
            <div class="dice-container" id="dice-container"></div>
        </dice>
        <div id="current-player"></div>
        <div class="game-info">
            <div class="game-code">
                Game Code: <span class="code-box">{{ gameData.id }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.player-name {
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
}
.game-info {
    display: flex;
    justify-content: center;
    align-items: center;
    .game-code {
        font-weight: 600;
        font-size: 1.2rem;
        background-color: aliceblue;
        padding: 1rem;
        border: 1px solid black;
        border-radius: 1rem;
        .code-box {
            font-size: 1.5rem;
            background-color: white;
            padding: 0.5rem;
            border: 1px solid black;
            border-radius: 1rem;
        }
    }
}
</style>