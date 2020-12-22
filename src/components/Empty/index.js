import { pure } from 'recompose';
import styles from './Empty.module.css'

function Empty({ children }) {
    return (
        <div className={styles.root}>
            {children}
        </div>
    )
}

export default pure(Empty);
