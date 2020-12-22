export function tracksLiked(store) {
    store.on('@init', () => {
        store.dispatch('tracksLiked/set', []);
    });

    store.on('tracksLiked/set', (_, tracksLiked) => {
        return {
            tracksLiked,
        }
    });
}
