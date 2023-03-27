import { v4 } from 'uuid'

export const setup = () => {
    const isPlayerDataPresent = localStorage.getItem('playerData');
    if (!isPlayerDataPresent) {
        const playerData = {
            name: '',
            id: v4(),
        }
        localStorage.setItem('playerData', JSON.stringify(playerData));
    }

    const isGameDataPresent = localStorage.getItem('gameData');
    if (isGameDataPresent) {
        // TODO: check if game is still active
    }
}

export const changeName = (name: string) => {
    const playerData = JSON.parse(localStorage.getItem('playerData') as string);
    playerData.name = name;
    localStorage.setItem('playerData', JSON.stringify(playerData));
}

export const getName = () => {
    const playerData = JSON.parse(localStorage.getItem('playerData') as string);
    return playerData.name;
}

export const getUserId = () => {
    const playerData = JSON.parse(localStorage.getItem('playerData') as string);
    return playerData.id;
}

export const setGameId = (id: string) => {
    const gameData = {
        id,
    }
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

export const getGameId = () => {
    const gameData = JSON.parse(localStorage.getItem('gameData') as string);
    return gameData.id;
}
