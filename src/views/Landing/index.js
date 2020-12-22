import Button from 'components/Button';
import { useStoreon } from 'storeon/react';

import styles from './Landing.module.css';

export default function Landing() {
    const { dispatch, musickitAuth, spotifyAuth } = useStoreon('musickitAuth', 'spotifyAuth');

    const titleAM = `Connect Apple Music ${musickitAuth ? '✔️' : ''}`;
    const titleSpotify = `Connect Spotify ${spotifyAuth ? '✔️' : ''}`;
    return (
        <div className={styles.landing}>
            <div className={styles.landing__content}>
                <h1 className={styles.landing__title}>Apple Music <span className={styles.landing__arrows}>&#x2194;</span> Spotify</h1>
                <p className={styles.landing__desc}>Import and export your music between two streaming services.</p>
                <div className={styles.landing__buttons}>
                    <Button
                        theme="am"
                        disabled={Boolean(musickitAuth)}
                        onClick={() => dispatch('musickit/auth')}
                        title={titleAM}>
                        {titleAM}
                    </Button>
                    <Button
                        theme="spotify"
                        disabled={Boolean(spotifyAuth)}
                        onClick={() => dispatch('spotify/auth')}
                        title={titleSpotify}>
                        {titleSpotify}
                    </Button>
                </div>
            </div>
        </div>
    )
}

