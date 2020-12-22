import { pure } from 'recompose';

import { ReactComponent as Svg } from 'img/spotify.svg';

import styles from './Logo.module.css'

export function LogoSpotify({ className, style, title }) {
    return (
        <Svg className={[styles.root, className].join(' ')}
            style={style || {}}
            title={title || 'Spotify'} />
    )
}

export default pure(LogoSpotify);
