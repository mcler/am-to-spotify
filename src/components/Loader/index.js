import { pure } from 'recompose';
import { ReactComponent as Svg } from 'img/circle-notch-regular.svg';

import styles from './Loader.module.css';

function Loader({ className, title }) {
    return (
        <Svg className={[styles.root, className].join(' ')}
            title={title || ''} />
    )
}

export default pure(Loader);
