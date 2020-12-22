import { pure } from 'recompose';

import styles from './NavItem.module.css';

function NavItem({ active, children, disabled, onClick }) {
    let classNames = [styles.root];
    if (active) {
        classNames.push(styles.rootActive)
    }
    return (
        <button className={classNames.join(' ')} disabled={disabled} type="button" onClick={onClick}>
            {children}
        </button>
    )
}

export default pure(NavItem);
