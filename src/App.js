import { lazy, Suspense } from 'react';
import { useStoreon } from 'storeon/react';

import Landing from 'views/Landing';
import Loading from 'components/Loading';

const Library = lazy(() => import('views/Library'))

function App() {
    const { musickitAuth, spotifyAuth } = useStoreon('musickitAuth', 'spotifyAuth');

    return (
        (!musickitAuth && !spotifyAuth)
            ? <Landing />
            : <Suspense fallback={<Loading/>}>
                <Library />
            </Suspense>

    );
}

export default App;
