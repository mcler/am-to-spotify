import { pure } from 'recompose';

import style from './Button.module.css';

function Button({ children, className, disabled, onClick, title, theme }) {
    let classNames = [style.button, className];
    if (theme === 'am' || theme === 'spotify') {
        classNames.push(style[`button--${theme}`]);
    }
    return (
        <button
            className={classNames.join(' ')}
            disabled={Boolean(disabled)}
            type="button"
            title={title}
            onClick={onClick}>
            {children}
        </button>
    )
}

export default pure(Button);
