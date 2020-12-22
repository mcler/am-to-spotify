export function progress (store) {
    store.on('@init', () => ({
        progress: {
            type: 'init',
            value: null,
        },
    }));

    store.on('progress/set_importing_lib', (_, { from, value }) => ({
        progress: {
            type: 'importing_lib',
            from,
            value,
        },
    }));

    store.on('progress/set_exporting_lib', (_, { to, value }) => ({
        progress: {
            type: 'exporting_lib',
            to,
            value,
        },
    }));

    store.on('progress/set_ready', (_, value = 0) => ({
        progress: {
            type: 'ready',
            value,
        },
    }));
}
