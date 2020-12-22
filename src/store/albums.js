import * as db from '../lib/db';

export function albums (store) {
    store.on('@init', ({ albums }) => {
        store.dispatch('albums/set', []);
        store.dispatch('albums/load_from_db');
        store.dispatch('progress/set_ready');
    });

    store.on('albums/set', (_, albums) => {
        return { albums }
    });

    store.on('albums/load_from_db', async () => {
        const albums = await db.albumsGetAll();
        store.dispatch('albums/set', albums);
    });

    store.on('albums/clear', async () => {
        store.dispatch('albums/set', []);
        // await db.clear();
    });

    store.on('albums/add', async (_, newalbums) => {
        await db.albumsAdd(newalbums);
        store.dispatch('albums/load_from_db');
    });

    store.on('albums/update', async (_, album) => {
        await db.albumUpdate(album);
        store.dispatch('albums/load_from_db');
    });
}
