import { openDB, deleteDB } from 'idb';

const DB_STORE_NAME = 'AM_SPOTIFY_TRACKS';
const DB_STORE_ALBUMS = 'ALBUMS';
const DB_STORE_TRACKS = 'TRACKS';
const DB_VERSION = 1;

/**
 * Открыть подключение к БД
 */
export function open() {
    return openDB(DB_STORE_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
            // Создаем таблицу треков
            const tracksStore = db.createObjectStore(DB_STORE_TRACKS, {
                keyPath: 'id',
                autoIncrement: true,
            });
            tracksStore.createIndex('name', 'name');
            tracksStore.createIndex('artist', 'artist');
            tracksStore.createIndex('musickit_track_id', 'musickit_track_id');
            tracksStore.createIndex('musickit_album_id', 'musickit_album_id');
            tracksStore.createIndex('musickit_track_love', 'musickit_track_love');
            tracksStore.createIndex('spotify_track_id', 'spotify_track_id');
            tracksStore.createIndex('spotify_album_id', 'spotify_album_id');
            tracksStore.createIndex('spotify_track_love', 'spotify_track_love');

            // Создаем таблицу альбомов
            const albumsStore = db.createObjectStore(DB_STORE_ALBUMS, {
                keyPath: 'id',
                autoIncrement: true,
            });
            tracksStore.createIndex('album_name', ['artist', 'year', 'album']);
            albumsStore.createIndex('musickit_album_id', 'musickit_album_id');
            albumsStore.createIndex('spotify_album_id', 'spotify_album_id');
            albumsStore.createIndex('spotify_album_love', 'spotify_album_love');
        },
    });
}

/**
 * Очистить БД
 */
export async function clear() {
    await deleteDB(DB_STORE_NAME);
    return (await open());
}

/**
 * Получить все треки из БД
 */
export async function tracksGetAll() {
    return (await open()).getAll(DB_STORE_TRACKS);
}

/**
 * Получить трек из БД
 * @param {nubmer} id
 */
export async function trackGet(id) {
    return (await open()).get(DB_STORE_TRACKS, id);
}

/**
 * Получить трек из БД
 * @param {string} index
 * @param {string|nubmer} value
 */
export async function trackGetByIndex(index, value) {
    return (await open()).index(index).get(DB_STORE_TRACKS, value);
}

/**
 * Добавить треки в БД
 * @param {array} tracks
 */
export async function tracksAdd(tracks) {
    const db = await open();
    const tx = db.transaction(DB_STORE_TRACKS, 'readwrite');
    return Promise.all([
        ...tracks.map(track => tx.store.add(track)),
        tx.done,
    ]).catch(console.log);
}

/**
 * Внести изменения в трек
 * @param {number} id
 * @param {object} track
 */
export async function trackUpdate(track) {
    return (await open()).put(DB_STORE_TRACKS, track);
}

/**
 * Удалить трек
 * @param {number} id
 */
export async function trackRemove(id) {
    return (await open()).delete(DB_STORE_TRACKS, id);
}

/**
 * Получить все альбомы из БД
 */
export async function albumsGetAll() {
    return (await open()).getAll(DB_STORE_ALBUMS);
}

/**
 * Получить альбом из БД
 * @param {nubmer} id
 */
export async function albumGet(id) {
    return (await open()).get(DB_STORE_ALBUMS, id);
}

/**
 * Добавить альбомы в БД
 * @param {array} albums
 */
export async function albumsAdd(albums) {
    const db = await open();
    const tx = db.transaction(DB_STORE_ALBUMS, 'readwrite');
    return Promise.all([
        ...albums.map(album => tx.store.add(album)),
        tx.done,
    ]).catch(console.log);
}

/**
 * Внести изменения в альбом
 * @param {number} id
 * @param {object} album
 */
export async function albumUpdate(album) {
    return (await open()).put(DB_STORE_ALBUMS, album);
}

/**
 * Удалить трек
 * @param {number} id
 */
export async function albumRemove(id) {
    return (await open()).delete(DB_STORE_ALBUMS, id);
}