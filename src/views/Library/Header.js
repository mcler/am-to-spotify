import { pure } from 'recompose';

import Button from 'components/Button';
import LogoApple from 'components/LogoApple';
import LogoSpotify from 'components/LogoSpotify';

import styles from './Library.module.css';

function isDisabledImport(progress) {
    return !progress || progress.type === 'init' || progress.type === 'importing_lib' || progress.type === 'exporting_lib';
}

function Header({ className, dispatch, musickitAuth, progress, spotifyAuth }) {
    const disabledImportExport = !musickitAuth || isDisabledImport(progress);

    const textAm = musickitAuth ? 'Exit' : 'Login';
    const titleAm = `${textAm} Apple Music`;
    const textSpotify = spotifyAuth ? 'Exit' : 'Login';
    const titleSpotify = `${textSpotify} Spotify`;
    return (
        <div className={className}>
            <div className={styles.header__cluster}>
                {musickitAuth && <Button
                    theme="am"
                    disabled={disabledImportExport}
                    onClick={() => dispatch('musickit/import')}
                    text="Import from Apple Music">
                    Import from <LogoApple />
                </Button>}

                {musickitAuth && <Button
                    theme="am"
                    disabled={true || disabledImportExport}
                    onClick={() => dispatch('musickit/export')}
                    text="Export to Apple Music">
                    Export to <LogoApple />
                </Button>}

                <Button theme="am"
                    onClick={() => dispatch(musickitAuth ? 'musickit/unauth' : 'musickit/auth')}
                    title={titleAm}>
                    {textAm} <LogoApple />
                </Button>
            </div>

            {/* <div className={styles.header__splitter} /> */}

            <div className={styles.header__cluster}>
                {spotifyAuth && <Button
                    theme="spotify"
                    disabled={disabledImportExport}
                    onClick={() => dispatch('spotify/import')}
                    title="Import from Spotify">
                    Import from <LogoSpotify />
                </Button>}
                {spotifyAuth && <Button
                    theme="spotify"
                    disabled={disabledImportExport}
                    onClick={() => dispatch('spotify/export')}
                    text="Export to Spotify">
                    Export to <LogoSpotify />
                </Button>}
                <Button theme="spotify"
                    onClick={() => dispatch(spotifyAuth ? 'spotify/unauth' : 'spotify/auth')}
                    title={titleSpotify}>
                    {textSpotify} <LogoSpotify />
                </Button>
            </div>
        </div>
    )
}

export default pure(Header);
