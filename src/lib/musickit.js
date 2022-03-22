import clamp from 'lodash/clamp';
import flatten from 'lodash/flatten';
import range from 'lodash/range';
import { PromisePool } from '@supercharge/promise-pool';

import { PROMISE_POOL_SIZE } from 'lib/consts';
import { APPLE_MUSIC_JWT } from 'lib/credentials';
import { musickitTrackToInternal, musickitAlbumToInternal } from 'lib/converters';

const LIMIT_MAX = 100;

const { MusicKit } = window; // https://js-cdn.music.apple.com/musickit/v1/musickit.js
MusicKit.configure({
    developerToken: APPLE_MUSIC_JWT,
    app: {
        name: 'Apple Music + Spotify sync',
        build: '1',
    },
});

export const TYPES = {
    song: 'songs',
    songs: 'songs',
    playlist: 'playlists',
    playlists: 'playlists',
    album: 'albums',
    albums: 'albums',
    station: 'stations',
    stations: 'stations',
    'library-songs': 'library-songs',
    'library-playlists': 'library-playlists',
    'library-albums': 'library-albums',
    'library-stations': 'library-stations',
};

export const instance = MusicKit.getInstance();
// window.musickit = instance;

/**
 * Returns headers for a fetch request to the Apple Music API.
 */
export function apiHeaders () {
    return new Headers({
        Authorization: 'Bearer ' + instance.developerToken,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Music-User-Token': '' + instance.musicUserToken
    });
}

/**
 * Авторизация
 */
export function auth() {
    return instance.authorize();
}

/**
 * Выход
 */
export function unauth() {
    return instance.unauthorize();
}

/**
 * Получить треки
 * @param {number} offset Смещение
 * @param {number} limit Количество
 */
export function getTracks(offset = 0, limit = LIMIT_MAX) {
    limit = clamp(limit, 0, LIMIT_MAX);
    return instance.api.library.songs(null, { limit, offset })
        .then(res => res.map(musickitTrackToInternal));
}

/**
 * Получить все треки
 * @param {function} onTracksAdd
 * @param {function} onSuccess
 * @param {function} onFail
 * @param {function} onFinish
 */
export async function getLibrary(onTracksAdd, onAlbumsAdd, onSuccess, onFail, onFinish) {
    let limit = LIMIT_MAX;
    let albums = [];
    let tracks = [];

    // Albums
    try {
        let loading = true;
        let offset = 0;
        while (loading) {
            let chunk = await getAlbums(offset, limit);
            if (!chunk || !chunk.length) {
                loading = false;
            } else {
                onAlbumsAdd(chunk);
                albums = albums.concat(chunk);
                offset += limit;
            }
        }
    } catch (error) {
        console.warn(error);
    }

    // Tracks
    try {
        let loading = true;
        let offset = 0;
        while (loading) {
            const baseOffset = offset;
            let { results } = await PromisePool
                .for(range(0, PROMISE_POOL_SIZE))
                .withConcurrency(PROMISE_POOL_SIZE)
                .process(async (i) => {
                    let chunk = await getTracks(baseOffset + i * limit, limit);
                    if (chunk && chunk.length) try {
                        let rating = await getRating(chunk.map(item => item.musickit_track_id));
                        if (rating) rating.forEach(({ id, attributes: { value } }) => {
                            let track = chunk.find(item => item.musickit_track_id === id)
                            track.musickit_track_love = value === 1;
                        });
                    } catch (error2) {
                        console.warn(error2);
                    }
                    return chunk;
                })
            results = flatten(results);

            if (!results || !results.length) {
                loading = false;
            } else {
                offset += limit * PROMISE_POOL_SIZE;
                if (onTracksAdd) {
                    onTracksAdd(results);
                }
                tracks = tracks.concat(results);
            }
        }

        if (onSuccess) {
            onSuccess(albums, tracks);
        }
    } catch (error) {
        console.warn(error);

        if (onFail) {
            onFail(error, albums, tracks);
        }
    }

    if (onFinish) {
        onFinish(albums, tracks);
    }

    return { albums, tracks };
}

/**
 * Получить рейтинг
 * @param {array} songIds
 * @param {string} type
 */
export function getRating (songIds = [], type = 'library-songs') {
    return fetch(`https://api.music.apple.com/v1/me/ratings/${TYPES[type]}/?ids=${songIds.join(',')}`, {
        headers: apiHeaders(),
    }).then(res => res.json()).then(res => res.data);
}

/**
 * Получить список альбомов
 * @param {number} limit Количество (<= 100)
 * @param {number} offset Смещение
 */
export function getAlbums(offset = 0, limit = LIMIT_MAX) {
    return instance.api.library.albums(null, { limit, offset })
        .then(res => res.map(musickitAlbumToInternal));
}

/**
 * Получить все альбомы
 * @param {function} onChunkAdd
 * @param {function} onSuccess
 * @param {function} onFail
 * @param {function} onFinish
 */
export async function getAllAlbums(onChunkAdd, onSuccess, onFail, onFinish) {
    let albums = [];
    try {
        let loading = true;
        let limit = LIMIT_MAX;
        let offset = 0;
        while (loading) {
            try {
                const baseOffset = offset;
                let { results } = await PromisePool
                    .for(range(0, PROMISE_POOL_SIZE))
                    .withConcurrency(PROMISE_POOL_SIZE)
                    .process(i => getAlbums(baseOffset + i * limit, limit));
                results = flatten(results);

                if (!results || !results.length) {
                    loading = false;
                } else {
                    offset += limit * PROMISE_POOL_SIZE;
                    if (onChunkAdd) {
                        onChunkAdd(results);
                    }
                    albums = albums.concat(results);
                }
            } catch (error) {
                console.warn(error);
                loading = false;
            }
        }

        if (onSuccess) {
            onSuccess(albums);
        }
    } catch (error) {
        console.warn('MusicKit error loading', error);

        if (onFail) {
            onFail(error, albums);
        }
    }

    if (onFinish) {
        onFinish(albums);
    }

    return albums;
}

/**
 * Добавить в библиотеку
 * @param {int} id Идентификатор
 * @param {string} type Тип сущности
 */
export function addToLibrary(id, type) {
    return instance.addToLibrary(id, type);
}

/**
 * Поиск
 */
export function search(query, types = ['songs'], limit = 1) {
    const term = Object.values(query).join(' ');
    return instance.api.search(term, { types, limit, offset: 0 });
}
