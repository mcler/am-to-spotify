import { useStoreon } from 'storeon/react';

import style from './Library.module.css';

import Header from './Header';
import Footer from './Footer';

import Albums from 'components/Albums';
import Tracks from 'components/Tracks';
import Nav from 'components/Nav';

function Library() {
    const {
        dispatch,
        albums,
        musickitAuth,
        nav,
        progress,
        selectedAlbums, selectedTracks,
        spotifyAuth,
        tracks, tracksLiked,
    } = useStoreon('albums', 'musickitAuth', 'nav', 'progress', 'selectedAlbums', 'selectedTracks', 'spotifyAuth', 'tracks', 'tracksLiked');
    const headerState = { dispatch, musickitAuth, progress, spotifyAuth };
    const footerState = { albums, progress, selectedAlbums, selectedTracks, tracks };
    const { current: navCurrent, items: navItems } = nav;
    return (
        <div className={style.library}>
            <Header className={style.library__header} {...headerState} />
            <div className={style.library__nav}>
                <Nav current={navCurrent} items={navItems} dispatch={dispatch} />
            </div>
            <div className={style.library__content}>
                {navCurrent === 'albums' && <Albums albums={albums} dispatch={dispatch} selected={selectedAlbums} />}
                {navCurrent === 'tracks' && <Tracks tracks={tracks} dispatch={dispatch} selected={false} />}
                {navCurrent === 'liked-tracks' && <Tracks tracks={tracksLiked} dispatch={dispatch} selected={selectedTracks} />}
            </div>
            <Footer className={style.library__footer} {...footerState} />
        </div>
    );
}

export default Library;
