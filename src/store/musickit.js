import delay from 'delay';
import { PromisePool } from '@supercharge/promise-pool';

import * as MusicKit from '../lib/musickit';
import { PROMISE_POOL_SIZE } from '../lib/consts';

export function musickit (store) {
    store.on('@init', () => ({
        musickitAuth: MusicKit.instance.isAuthorized,
    }));

    store.on('musickit/auth', async () => {
        await MusicKit.auth();
        store.dispatch('musickit/set_auth');
    });

    store.on('musickit/unauth', async () => {
        await MusicKit.unauth();
        store.dispatch('musickit/set_auth');
    });

    store.on('musickit/set_auth', () => {
        return { musickitAuth: MusicKit.instance.isAuthorized };
    });

    store.on('musickit/import', () => {
        store.dispatch('progress/set_importing_lib', { value: 0, from: 'musickit' });
        store.dispatch('albums/clear');
        store.dispatch('tracks/clear');

        MusicKit.getLibrary(
            (tracks) => store.dispatch('tracks/add', tracks),
            (albums) => store.dispatch('albums/add', albums),
            null,
            null,
            () => store.dispatch('progress/set_ready'),
        );
    });

    store.on('musickit/export', async ({ albums, tracks, selectedAlbums, selectedTracks }) => {
        console.log('musickit/export');

        const albumsLiked = albums.filter(album => selectedAlbums.includes(album.id));
        const tracksLiked = tracks.filter(track => selectedTracks.includes(track.id));
        const total = albumsLiked.length + tracksLiked.length;
        let counter = 0;

        store.dispatch('progress/set_exporting_lib', { to: 'am', value: `0/${total}` });

        await PromisePool
            .for(albumsLiked)
            .withConcurrency(PROMISE_POOL_SIZE)
            .process(async (album) => {
                counter += 1;
                store.dispatch('progress/set_exporting_lib', { to: 'am', value: `${counter}/${total}` });

                if (album.id % PROMISE_POOL_SIZE === 0) await delay(1000);

                try {
                    const result = await MusicKit.search({
                        artist: album.artist,
                        album: album.album,
                    }, ['album'], 1);
                    let spotifyAlbum = result?.albums?.items[0];
                    if (!spotifyAlbum || !spotifyAlbum.id) {
                        return;
                    }
                    // // await delay(500);
                    // await Spotify.addToMySavedAlbums([spotifyAlbum.id]);
                    // store.dispatch('albums/update', {
                    //     ...album,
                    //     spotify_album_id: spotifyAlbum.id,
                    //     spotify_artist_id: spotifyAlbum.artist?.id,
                    //     spotify_album_love: true,
                    // });
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
                store.dispatch('progress/set_exporting_lib', { to: 'am', value: `${counter}/${total}` });

                if (track.id % PROMISE_POOL_SIZE === 0) await delay(1000);

                try {
                    // const result = await Spotify.search({
                    //     artist: track.artist,
                    //     track: track.name,
                    //     album: track.album,
                    // }, ['track'], 1);
                    // let spotifyTrack = result?.tracks?.items[0];
                    // if (!spotifyTrack || !spotifyTrack.id) {
                    //     return;
                    // }
                    // let artistLoved = false;
                    // let albumLoved = false;
                    // let trackLoved = false;

                    // if (!spotifyTrack?.album?.id || track.musickit_track_love) {
                    //     await Spotify.addToMySavedTracks([spotifyTrack.id]);
                    //     trackLoved = true;
                    // }

                    // store.dispatch('tracks/update', {
                    //     ...track,
                    //     spotify_track_id: spotifyTrack?.id,
                    //     spotify_album_id: spotifyTrack?.album?.id,
                    //     spotify_artist_id: spotifyTrack?.artist?.id,
                    //     spotify_artist_love: artistLoved,
                    //     spotify_album_love: albumLoved,
                    //     spotify_track_love: trackLoved,
                    // });
                } catch (error) {
                    console.warn(error);
                    await delay(1000);
                }
            });

        store.dispatch('progress/set_ready', counter);
    });
}
