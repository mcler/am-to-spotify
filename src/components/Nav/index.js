import { pure } from 'recompose';

import NavItem from 'components/NavItem';
import styles from './Nav.module.css';

function Nav({ current, dispatch, items }) {
    return (
        <div className={styles.root}>
            {items.map(({ disabled, key, text }) => (
                <NavItem
                    key={key}
                    active={current === key}
                    disabled={disabled}
                    onClick={() => dispatch('nav/set', key)}>{text}</NavItem>
            ))}
        </div>
    )
}

export default pure(Nav);
