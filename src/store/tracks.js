import * as db from '../lib/db';

export function tracks (store) {
    store.on('@init', () => {
        store.dispatch('tracks/set', []);
        store.dispatch('tracks/load_from_db');
        store.dispatch('progress/set_ready');
    });

    store.on('tracks/set', (_, tracks) => {
        return {
            tracks,
        }
    });

    store.on('tracks/load_from_db', async () => {
        const tracks = await db.tracksGetAll();
        store.dispatch('tracks/set', tracks);
        store.dispatch('tracksLiked/set', tracks.filter(track => track.musickit_track_love || track.spotify_track_love));
    });

    store.on('tracks/clear', async () => {
        store.dispatch('tracks/set', []);
        store.dispatch('tracksLiked/set', []);
        await db.clear();
    });

    store.on('tracks/add', async (_, newTracks) => {
        await db.tracksAdd(newTracks);
        store.dispatch('tracks/load_from_db');
    });

    store.on('tracks/update', async (_, track) => {
        await db.trackUpdate(track);
        store.dispatch('tracks/load_from_db');
    });
}
