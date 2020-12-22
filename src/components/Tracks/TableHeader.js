import { pure } from 'recompose';

import styles from './Table.module.css';

// import LogoApple from 'components/LogoApple';
// import LogoSpotify from 'components/LogoSpotify';

function TableHeader({ dispatch, tracks, selected }) {
    const checked = tracks && selected && tracks.length === selected.length;
    return (
        <div className={styles.table__header}>
            <div className={`${styles.row} ${styles['row--header']}`}>
                {selected && <div className={`${styles.col} ${styles['col--icon']}`}>
                    <input
                        type="checkbox"
                        name={`track-all`}
                        title="Select all"
                        checked={checked}
                        onChange={() => dispatch('selectedTracks/set', checked ? [] : tracks.map(track => track.id))} />
                </div>}
                <div className={styles.col}>Track Name</div>
                <div className={styles.col}>Artist</div>
                <div className={styles.col}>Album</div>
                <div className={`${styles.col} ${styles['col--year']}`}>Year</div>
                <div className={`${styles.col} ${styles['col--icon']}`} cols="2">
                    {/* <LogoApple className={`${styles.col__icon} color-am`}></LogoApple> */}
                </div>
                <div className={`${styles.col} ${styles['col--icon']}`} cols="2">
                    {/* <LogoSpotify className={`${styles.col__icon} color-spotify`}></LogoSpotify> */}
                </div>
                <div className={styles.col}></div>
            </div>
        </div>
    )
}

export default pure(TableHeader);
