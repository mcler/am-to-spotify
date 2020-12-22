let albums = new Set();

export function selectedAlbums (store) {
    store.on('@init', () => {
        store.dispatch('selectedAlbums/refresh');
    });

    store.on('selectedAlbums/refresh', () => {
        return {
            selectedAlbums: Array.from(albums),
        }
    });

    store.on('selectedAlbums/set', (_, ids) => {
        albums = new Set(ids);
        store.dispatch('selectedAlbums/refresh');
    });

    store.on('selectedAlbums/add', (_, id) => {
        albums.add(id);
        store.dispatch('selectedAlbums/refresh');
    });

    store.on('selectedAlbums/remove', (_, id) => {
        albums.delete(id);
        store.dispatch('selectedAlbums/refresh');
    });

    store.on('selectedAlbums/toggle', (_, id) => {
        const action = albums.has(id) ? 'remove' : 'add';
        store.dispatch(`selectedAlbums/${action}`, id);
    });
}
