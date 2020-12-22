let tracks = new Set();

export function selectedTracks (store) {
    store.on('@init', () => {
        store.dispatch('selectedTracks/refresh');
    });

    store.on('selectedTracks/refresh', () => {
        return {
            selectedTracks: Array.from(tracks),
        }
    });

    store.on('selectedTracks/set', (_, ids) => {
        tracks = new Set(ids);
        store.dispatch('selectedTracks/refresh');
    });

    store.on('selectedTracks/add', (_, id) => {
        tracks.add(id);
        store.dispatch('selectedTracks/refresh');
    });

    store.on('selectedTracks/remove', (_, id) => {
        tracks.delete(id);
        store.dispatch('selectedTracks/refresh');
    });

    store.on('selectedTracks/toggle', (_, id) => {
        const action = tracks.has(id) ? 'remove' : 'add';
        store.dispatch(`selectedTracks/${action}`, id);
    });
}
