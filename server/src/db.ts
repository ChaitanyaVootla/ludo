import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

sqlite3.verbose();
export type DB = Database<sqlite3.Database, sqlite3.Statement>;

export const setupDb = async () => {
    const db = await open({
        filename: ':memory:',
        // filename: 'db.sqlite',
        driver: sqlite3.Database,
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY NOT NULL,
        properties TEXT NOT NULL,
        status TEXT NOT NULL,
        snapshot TEXT,
        lastMove TEXT
    )
    `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS gamePlayers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playerId TEXT NOT NULL,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL
    )
    `);

    const games = await db.all(`Select * from games`);
    console.log(`${games.length} games found in db`)
    return db;
}

export const createGame = async (db: DB, id: string, creatorData: any) => {
    db.run(`INSERT INTO games(id, properties, status) VALUES ('${id}', '${JSON.stringify(creatorData)}', 'created')`)
    const game = await db.get('SELECT * FROM games WHERE id = ?', [id]);
    await db.run(`INSERT INTO gamePlayers(playerId, gameId, name, color) VALUES ('${creatorData.userData.id}', '${
        game.id}', '${creatorData.userData.name}', 'green')`)
    const gamePlayers = await db.all('SELECT * FROM gamePlayers WHERE gameId = ?', [game.id]);
    return [game, gamePlayers];
}

export const getGameData = async (db: DB, id: string) => {
    const game = await db.get('SELECT * FROM games WHERE id = ?', [id]);
    const gamePlayers = await db.all('SELECT * FROM gamePlayers WHERE gameId = ?', [id]);
    if (!game) {
        return null;
    }
    return {
        ...game,
        properties: JSON.parse(game.properties),
        snapshot: JSON.parse(game.snapshot),
        players: gamePlayers,
    };
}

export const getAllGames = async (db: DB) => {
    const games = await db.all('SELECT * FROM games');
    return games;
}

export const updateGameSnapshot = async (db: DB, id: string, snapshot: string) => {
    await db.run(`UPDATE games SET snapshot = '${snapshot}' WHERE id = '${id}'`);
}
