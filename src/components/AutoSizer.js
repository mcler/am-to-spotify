import { createRef, PureComponent } from 'react';
import debounce from 'lodash/debounce';

export default class AutoSizer extends PureComponent {
    constructor(props) {
        super(props);

        this.observer = new ResizeObserver(debounce((entries) => {
            let { height, width }= entries[0].contentRect;
            height = Math.floor(height);
            width = Math.floor(width);
            this.setState({ height, width })
        }, 200, {
            leading: false,
            maxWait: 1000,
            trailing: true,
        }));

        this.getState = this.getState.bind(this);
        this.ref = createRef();
        this.state = this.getState();
    }

    getState(height = 0, width = 0, calculateStyles = true) {
        let heightInner = height;
        let widthInner = width;

        if (calculateStyles && this.ref.current) {
            const style = getComputedStyle(this.ref.current);
            heightInner = height - parseInt(style.paddingTop) - parseInt(style.paddingBottom);
            widthInner = width - parseInt(style.paddingLeft) - parseInt(style.paddingRight);
        }

        return {
            heightInner, widthInner,
            height, width,
        }
    }

    componentDidMount() {
        if (this.ref.current) {
            this.observer.observe(this.ref.current)
        }
    }

    componentWillUnmount() {
        this.observer.unobserve(this.ref.current);
        this.setState(this.getState(0, 0, false));
    }

    render() {
        const { children, className, style } = this.props;
        const { ref } = this;
        const { heightInner, widthInner, height, width } = this.state;
        const hasMeasuredSize = height > 0 && width > 0;
        return (
            <div ref={ref} className={className} style={style || {}}>
                {hasMeasuredSize && children({ heightInner, widthInner, height, width })}
            </div>
        );
    }
}
