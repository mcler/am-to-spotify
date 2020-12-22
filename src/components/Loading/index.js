import { pure } from 'recompose';

import Loader from 'components/Loader';

import styles from './Loading.module.css';

function Loading({ children }) {
    return (
        <div className={styles.loading}>
            <div className={styles.inner}>
                <Loader/> {children}
            </div>
        </div>
    )
}

export default pure(Loading);