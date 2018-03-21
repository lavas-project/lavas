import React, {Component} from 'react';

const DURATION = 3000;

export default class ProgressBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            percent: 0,
            show: false,
            canSuccess: true
        };
    }

    render() {
        const progressStyle = {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            width: 0,
            transition: 'width .2s, opacity .4s',
            opacity: 1,
            backgroundColor: '#efc14e',
            zIndex: 999999
        };

        let {percent, show, canSuccess} = this.state;
        return (
            <div style={Object.assign(progressStyle, {
                width: percent + '%',
                backgroundColor: canSuccess ? '#ffca2b' : '#ff0000',
                opacity: show ? 1 : 0
            })}></div>
        );
    }

    componentDidMount() {
        if (this.props.loading) {
            this.start();
        }
        else {
            this.finish();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loading === this.props.loading) {
            return;
        }
        if (nextProps.loading) {
            this.start();
        }
        else {
            this.finish();
        }
    }

    start() {
        if (this._timer) {
            clearInterval(this._timer);
        }

        this.setState({
            percent: 0,
            show: true,
            canSuccess: true
        }, () => {
            this._cut = 10000 / Math.floor(DURATION);
            this._timer = setInterval(() => {
                this.increase(this._cut * Math.random());
                if (this.state.percent > 95) {
                    this.finish();
                }
            }, 100);
        });
    }

    set(num) {
        this.setState({
            show: true,
            canSuccess: true,
            percent: Math.floor(num)
        });
    }

    get() {
        return Math.floor(this.state.percent);
    }

    increase(num) {
        let old = this.state.percent;
        this.setState({
            percent: old + Math.floor(num)
        });
    }

    decrease(num) {
        let old = this.state.percent;
        this.setState({
            percent: old - Math.floor(num)
        });
    }

    finish() {
        this.setState({
            percent: 100
        });
        this.hide();
    }

    pause() {
        clearInterval(this._timer);
    }

    hide() {
        clearInterval(this._timer);
        this._timer = null;
        setTimeout(() => {
            this.setState({
                show: false,
                percent: 0
            });
        }, 500);
    }

    fail() {
        this.setState({canSuccess: false});
    }
};
