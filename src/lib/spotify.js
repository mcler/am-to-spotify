import clamp from 'lodash/clamp';
import flatten from 'lodash/flatten';
import range from 'lodash/range';
import PromisePool from '@supercharge/promise-pool';

import SpotifyWebApi from 'spotify-web-api-js';
import { PROMISE_POOL_SIZE, SPOTIFY_SCOPES } from 'lib/consts';
import { SPOTIFY_CLIENT_ID } from 'lib/credentials';
import { spotifyAlbumToInternal, spotifyTrackToInternal } from 'lib/converters';

const STORAGE_TOKEN_KEY = 'spotify-access-token';
const STORAGE_EXPIRES_KEY = 'spotify-access-expires';

const LIMIT_MAX = 50;

/**
 * Конвертер объекта в строку поиска
 * @param {object} obj
 */
function toSearchString(obj) {
    return Object.entries(obj)
        .filter((item) => Boolean(item[1]))
        .map(([key, value]) => `${key}:${value}`)
        .join(' ');
}

export function getAccessToken() {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    let expires = localStorage.getItem(STORAGE_EXPIRES_KEY);
    expires = Number(expires);
    spotifyApi.setAccessToken(token);
    return { token, expires };
}

export function saveAccessToken(token, expires) {
    spotifyApi.setAccessToken(token);
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_EXPIRES_KEY, expires);
}

export const spotifyApi = new SpotifyWebApi();
// window.spotifyApi = spotifyApi;

export function auth() {
    const scope = SPOTIFY_SCOPES.join(' ');
    const redirect = `${window.location.origin}/`;
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scope)}`;
}

/**
 * Поиск
 * @param {object} query Поисковый запрос
 * @param {string[]} types Типы возвращаемых сущностей
 * @param {int} limit Ограничение числа возвращаемых результатов
 */
export function search(query = {}, types = ['track'], limit = 5) {
    if (!query || !types || !types.length) {
        return Promise.reject();
    }
    const queryString = toSearchString(query);
    if (!queryString) {
        return Promise.reject();
    }
    return spotifyApi.search(queryString, types, { limit });
}

/**
 * Получить треки из бибилиотеки
 * @param {number} offset Смещение
 * @param {number} limit Количество
 */
export function getTracks(offset = 0, limit = LIMIT_MAX) {
    limit = clamp(limit, 0, LIMIT_MAX);
    return spotifyApi.getMySavedTracks({ offset, limit })
        .then(res => res.items.map(item => spotifyTrackToInternal(item.track)));
}

/**
 * Получить треки из бибилиотеки
 * @param {boolean} convertToInternal Смещение
 */
export async function getAllTracks(convertToInternal = false) {
    const limit = LIMIT_MAX;
    let tracks = [];

    try {
        let loading = true;
        let offset = 0;
        while (loading) {
            const { items } = await spotifyApi.getMySavedTracks({ offset, limit });
            if (!items || !items.length) {
                loading = false;
                continue;
            }
            tracks = tracks.concat(items.map(item => item.track));
            offset += limit;
        }
    } catch (error) {
        console.warn(error);
    }

    if (convertToInternal) {
        return tracks.map(spotifyTrackToInternal);
    }

    return tracks;
}

/**
 * Получить все треки
 * @param {function} onTracksAdd
 * @param {function} onAlbumsAdd
 * @param {function} onSuccess
 * @param {function} onFail
 * @param {function} onFinish
 */
export async function getLibrary(onTracksAdd, onAlbumsAdd, onSuccess, onFail, onFinish) {
    const limit = LIMIT_MAX;

    let albums = [];
    let tracks = [];
    let likedTracks = await getAllTracks();
    likedTracks = likedTracks.map(item => item.id);

    try {
        let loading = true;
        let offset = 0;
        const poolRange = range(0, PROMISE_POOL_SIZE);
        while (loading) {
            try {
                const baseOffset = offset;
                let { results } = await PromisePool
                    .for(poolRange)
                    .withConcurrency(PROMISE_POOL_SIZE)
                    .process(async (i) => {
                        const { items } = await getAlbums(baseOffset + i * limit, limit);

                        if (onAlbumsAdd) {
                            onAlbumsAdd(items.map(item => spotifyAlbumToInternal(item.album, true)));
                        }

                        return flatten(
                            items.map(
                                item => item.album.tracks.items
                                    .map(
                                        track => spotifyTrackToInternal(
                                            track,
                                            item.album,
                                            likedTracks.includes(track.id),
                                        )
                                    )
                            )
                        );
                    })
                    .catch((error) => {
                        console.warn('Spotify error loading', error);
                    });
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
            } catch (error) {
                console.warn("WEEEEEE", error);
                loading = false;
            }
        }

        if (onSuccess) {
            onSuccess(albums, tracks);
        }
    } catch (error) {
        console.warn('Spotify error loading', error);

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
 * Получить альбомы из бибилиотеки
 * @param {number} offset Смещение
 * @param {number} limit Количество
 */
export function getAlbums(offset = 0, limit = LIMIT_MAX) {
    limit = clamp(limit, 0, LIMIT_MAX);
    return spotifyApi.getMySavedAlbums({ offset, limit });
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
                    .process(i => getAlbums(baseOffset + i * limit, limit))
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
        console.warn('Spotify error loading', error);

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
 * Зафолловить артистов
 * @param {int[]} artistsId
 */
export function followArtist(artistsId = []) {
    return spotifyApi.followArtists(artistsId);
}

/**
 * Добавить альбомы в сохраненные
 * @param {int[]} albumsIds
 */
export function addToMySavedAlbums(albumsIds = []) {
    return spotifyApi.addToMySavedAlbums(albumsIds);
}

/**
 * Добавить треки в сохраненные
 * @param {int[]} tracksIds
 */
export function addToMySavedTracks(tracksIds = []) {
    return spotifyApi.addToMySavedTracks(tracksIds);
}

/**
 * Добавить треки в плейлист
 * @param {int} playlistId
 * @param {int[]} trackUris
 */
export function addTrackToPlaylist(playlistId, trackUris) {
    return spotifyApi.addTracksToPlaylist(playlistId, trackUris);
}
