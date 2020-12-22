import { pure } from 'recompose';

import Loader from 'components/Loader';

import style from './Library.module.css';

const SOURCES = {
    musickit: 'Apple Music',
    spotify: 'Spotify',
}

function Footer({ className, albums, progress, selectedAlbums, selectedTracks, tracks }) {
    let statusText = '';
    let selectedText = '';
    let loading = false;

    switch (progress.type) {
    case 'importing_lib':
        statusText = 'Importing library';
        loading = true;
        break;
    case 'exporting_lib':
        statusText = 'Exporting library';
        loading = true;
        break;
    default:
        statusText = '';
    }

    if (selectedAlbums.length || selectedTracks.length) {
        selectedText = 'Selected for export:';
        if (selectedAlbums.length) {
            selectedText = `${selectedText} ${selectedAlbums.length} albums`;
        }
        if (selectedTracks.length) {
            if (selectedAlbums.length) {
                selectedText = `${selectedText},`;
            }
            selectedText = `${selectedText} ${selectedTracks.length} tracks`;
        }
    }

    if (statusText) {
        if (progress.from) {
            statusText = `${statusText} from ${SOURCES[progress.from]}`;
        }
        if (progress.to) {
            statusText = `${statusText} to ${SOURCES[progress.to]}`;
        }
        const value = progress.value ? `: ${progress.value}` : '...';
        statusText = `${statusText}${value}`;
    }

    const libraryText = `Library: ${albums.length} albums, ${tracks.length} tracks`;

    return (
        <div className={className}>
            <div className={style.footer__status}>
                {loading && <Loader/>} {statusText}
            </div>
            <div className={style.footer__selected}>
                {selectedText}
            </div>
            <div className={style.footer__library}>
                {libraryText}
            </div>
        </div>
    )
}

export default pure(Footer);
