import { pure } from "recompose";

import LogoApple from 'components/LogoApple';
import LogoSpotify from 'components/LogoSpotify';

import styles from './Table.module.css';

function TableRow({ data, index, style }) {
    const { dispatch, selected, tracks } = data;
    if (tracks[index] === null) {
        return (
            <div className={styles.row} style={style}></div>
        )
    }
    const track = tracks[index];
    const checked = selected ? selected.includes(track.id) : null;
    const {
        id,
        artist, album, name, year,
        musickit_track_id, musickit_track_love,
        spotify_track_id, spotify_album_love, spotify_track_love } = track;
    return (
        <div className={`${styles.row}`}
            style={style}
            onClick={() => checked !== null && dispatch('selectedTracks/toggle', id)}>
            {checked !== null && <div className={`${styles.col} ${styles['col--icon']}`}>
                <input type="checkbox"
                    name={`track-${id}`}
                    title={`Select ${artist} – ${name}`}
                    checked={checked || false}
                    readOnly={true} />
            </div>}
            <div className={`${styles.col}`}>{name}</div>
            <div className={`${styles.col}`}>{artist}</div>
            <div className={`${styles.col}`}>{album}</div>
            <div className={`${styles.col} ${styles['col--year']}`}>{year}</div>
            <div className={`${styles.col} ${styles['col--icon']}`}>
                {musickit_track_id ? <LogoApple/> : ''}
            </div>
            <div className={`${styles.col} ${styles['col--icon']}`}>
                {musickit_track_love ? '❤️' : ''}
            </div>
            <div className={`${styles.col} ${styles['col--icon']}`}>
                {spotify_track_id ? <LogoSpotify/> : ''}
            </div>
            <div className={`${styles.col} ${styles['col--icon']}`}>
                {(spotify_track_love || spotify_album_love) ? '❤️' : ''}
            </div>
            <div className={`${styles.col}`}></div>
        </div>
    );
}

export default pure(TableRow);
