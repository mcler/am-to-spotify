import delay from 'delay';
import { PromisePool } from '@supercharge/promise-pool';

import { PROMISE_POOL_SIZE } from '../lib/consts';
import * as Spotify from '../lib/spotify';

export function spotify (store) {
    store.on('@init', () => {
        let dateNow = Date.now();
        let { hash } = new URL(window.location.href);
        let spotifyAuth = null;
        if (hash) {
            hash = hash.split('&');
            if (hash[0] && hash[0].includes('#access_token=')) {
                let token = hash[0].replace('#access_token=', '');
                let expires;
                if (hash[2] && hash[2].includes('expires_in=')) {
                    expires = hash[2].replace('expires_in=', '');
                    expires = Number(expires);
                    expires = expires * 1000 + dateNow;
                }
                spotifyAuth = { token, expires };
                if (token) {
                    Spotify.saveAccessToken(token, expires);
                }
            }

            if (window.history) {
                window.history.replaceState("", document.title, window.location.pathname);
            } else {
                window.location.href = window.location.href.substr(0, window.location.href.indexOf('#'));
            }
        } else {
            spotifyAuth = Spotify.getAccessToken();
        }

        if (spotifyAuth && spotifyAuth.expires && spotifyAuth.expires - dateNow > 0) {
            setTimeout(() => {
                console.log('expired');
                window.location.reload();
            }, spotifyAuth.expires - dateNow);
        } else {
            spotifyAuth = null;
        }

        return { spotifyAuth };
    });

    store.on('spotify/auth', () => {
        console.log('spotify/auth');
        Spotify.auth();
    });

    store.on('spotify/unauth', () => {
        console.log('spotify/unauth');
        let spotifyAuth = '';
        Spotify.saveAccessToken('', '');
        return { spotifyAuth };
    });

    store.on('spotify/import', () => {
        store.dispatch('progress/set_importing_lib', { from: 'spotify', value: 0 });
        store.dispatch('albums/clear');
        store.dispatch('tracks/clear');

        Spotify.getLibrary(
            (tracks) => store.dispatch('tracks/add', tracks),
            (albums) => store.dispatch('albums/add', albums),
            null,
            null,
            () => store.dispatch('progress/set_ready'),
        );
    });

    store.on('spotify/export', async ({ albums, tracks, selectedAlbums, selectedTracks }) => {
        console.log('spotify/export');

        const albumsLiked = albums.filter(album => !album.spotify_album_id && selectedAlbums.includes(album.id));
        const tracksLiked = tracks.filter(track => track.musickit_track_love && !track.spotify_track_id && selectedTracks.includes(track.id));
        const total = albumsLiked.length + tracksLiked.length;
        let counter = 0;

        store.dispatch('progress/set_exporting_lib', { to: 'spotify', value: `0/${total}` });

        await PromisePool
            .for(albumsLiked)
            .withConcurrency(PROMISE_POOL_SIZE)
            .process(async (album) => {
                counter += 1;
                store.dispatch('progress/set_exporting_lib', { to: 'spotify', value: `${counter}/${total}` });

                if (album.id % PROMISE_POOL_SIZE === 0) await delay(1000);

                try {
                    const result = await Spotify.search({
                        artist: album.artist,
                        album: album.album,
                    }, ['album'], 1);
                    let spotifyAlbum = result?.albums?.items[0];
                    if (!spotifyAlbum || !spotifyAlbum.id) {
                        return;
                    }
                    // await delay(500);
                    await Spotify.addToMySavedAlbums([spotifyAlbum.id]);
                    store.dispatch('albums/update', {
                        ...album,
                        spotify_album_id: spotifyAlbum.id,
                        spotify_artist_id: spotifyAlbum.artist?.id,
                        spotify_album_love: true,
                    });
                } catch (error) {
                    console.warn(error);
                    await delay(1000);
                }
            });

        await PromisePool
            .for(tracksLiked)
            .withConcurrency(PROMISE_POOL_SIZE)
            .process(async (track) => {
                counter += 1;
                store.dispatch('progress/set_exporting_lib', { to: 'spotify', value: `${counter}/${total}` });

                if (track.id % PROMISE_POOL_SIZE === 0) await delay(1000);

                try {
                    // console.log('track', track.spotify_track_id, track);
                    const result = await Spotify.search({
                        artist: track.artist,
                        track: track.name,
                        album: track.album,
                    }, ['track'], 1);
                    let spotifyTrack = result?.tracks?.items[0];
                    if (!spotifyTrack || !spotifyTrack.id) {
                        return;
                    }
                    let artistLoved = false;
                    let albumLoved = false;
                    let trackLoved = false;
                    // if (spotifyTrack?.album?.id) {
                    //     albumLoved = true;
                    //     savedToSpotify = true;
                    // }
                    if (!spotifyTrack?.album?.id || track.musickit_track_love) {
                        // await delay(500);
                        await Spotify.addToMySavedTracks([spotifyTrack.id]);
                        trackLoved = true;
                    }
                    // if (albumLoved && trackLoved && spotifyTrack?.artist?.id) {
                    //     await Spotify.followArtist([spotifyTrack.album.id]);
                    // }

                    store.dispatch('tracks/update', {
                        ...track,
                        spotify_track_id: spotifyTrack?.id,
                        spotify_album_id: spotifyTrack?.album?.id,
                        spotify_artist_id: spotifyTrack?.artist?.id,
                        spotify_artist_love: artistLoved,
                        spotify_album_love: albumLoved,
                        spotify_track_love: trackLoved,
                    });
                } catch (error) {
                    console.warn(error);
                    await delay(1000);
                }
            });

        store.dispatch('progress/set_ready', counter);
    });
}
