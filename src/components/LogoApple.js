import { pure } from 'recompose';

import { ReactComponent as Svg } from 'img/apple.svg';

import styles from './Logo.module.css'

export function LogoApple({ className, style, title }) {
    return (
        <Svg className={[styles.root, className].join(' ')}
            style={style || {}}
            title={title || 'Apple Music'} />
    )
}

export default pure(LogoApple);
