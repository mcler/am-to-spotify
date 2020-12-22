import { Component, memo } from 'react';

import styles from './Album.module.css';

const timeout = (callback) => window.setTimeout(callback, 333);
const execAtGoodTime = window.requestAnimationFrame
    ?? window.requestIdleCallback
    ?? timeout;

const cache = new Set();

class Album extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
        this.state = { loaded: cache.has(props.artwork) };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onLoad(artwork) {
        cache.add(artwork);
        timeout(() => {
            execAtGoodTime(() => {
                if (!this._isMounted) return;
                this.setState({
                    loaded: true,
                });
            });
        });
    }

    getIndex(props) {
        const { data, columnIndex, rowIndex } = props;
        const { columnCount } = data;
        return rowIndex * columnCount + columnIndex;
    }

    getAlbum(props) {
        const index = this.getIndex(props);
        const { data } = props;
        const { albums } = data;
        return albums[index];
    }

    getChecked(props) {
        const { data } = props;
        const { selected } = data;
        const album = this.getAlbum(props);
        return selected ? selected.includes(album.id) : null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        const currentAlbum = this.getAlbum(this.props);
        const currentLoaded = this.state.loaded;
        const currentChecked = this.getChecked(this.props);
        const nextAlbum = this.getAlbum(nextProps);
        const nextLoaded = nextState.loaded;
        const nextChecked = this.getChecked(nextProps);

        return (currentAlbum && nextAlbum && currentAlbum.id !== nextAlbum.id)
            || (!!currentAlbum && !nextAlbum) || (!currentAlbum && !!nextAlbum)
            || currentLoaded !== nextLoaded
            || currentChecked !== nextChecked;
    }

    render() {
        const { data, style } = this.props;
        const { dispatch } = data;
        const index = this.getIndex(this.props);
        const album = this.getAlbum(this.props);

        if (!album) {
            return (
                <div key={`albums-grid-id-${index}`} />
            )
        }

        // const key = `albums-grid-id-${album.id}`;
        const checked = this.getChecked(this.props);
        const { id, artist, album: name, year } = album;
        const { loaded } = this.state;

        let { artwork_md: artwork } = album;
        if (!artwork || artwork.indexOf('blobstore') !== -1) {
            artwork = null;
        }

        const coverClassName = [
            styles.cover,
            (loaded && styles['cover--loaded']) || '',
            (!artwork && styles['cover--empty']) || '',
        ].join(' ');

        return (
            <div className={styles.album} style={style}>
                <div className={coverClassName} onClick={() => dispatch('selectedAlbums/toggle', id)}>
                    {artwork && <img
                        src={artwork}
                        loading="lazy"
                        alt={`${artist} – ${name} (${year})`}
                        onLoad={this.onLoad(artwork)}
                    />}
                    {checked !== null && <input
                        type="checkbox"
                        className={styles.cover__check}
                        name={`track-${id}`}
                        title={`Export ${artist} – ${name}`}
                        checked={checked ?? false}
                        readOnly={true}
                    />}
                </div>
                <div className={styles.album__title}>
                    {name} <span className={styles.album__year}>{year}</span>
                </div>
                <div className={styles.album__artist}>
                    {artist}
                </div>
            </div>
        );
    }
}

export default memo(Album);
