import { NAV_ITEMS as items } from 'lib/consts';

export function nav (store) {
    store.on('@init', () => {
        store.dispatch('nav/set', 'albums');
    });

    store.on('nav/set', (_, current) => {
        return {
            nav: { current, items },
        };
    });
}
