import React from 'react';
import style from './Sidebar.styl';
import IScroll from 'iscroll/build/iscroll-lite';

let rAF = function (cb) {
    setTimeout(cb, 1000 / 60);
};
// // 兼容服务器端渲染的情况
// if (process.env.REACT_ENV === 'client') {
//     rAF = window.requestAnimationFrame
//         || window.webkitRequestAnimationFrame
//         || rAF;
// }

function clientWidth() {
    return document.documentElement.clientWidth;
}

function clientHeight() {
    return document.documentElement.clientHeight;
}

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        
        this.clientWidth = 320;
        this.clientHeight = 568;
        this.startX = 0;
        this.startY = 0;
        this.scrollEnable = false;
        this.iscroll = null;
        this.itsWidth = this.getItsWidth();

        // 跟渲染无关的尽量不挂在 state 上
        this.state = {
            wrapperClass: {
                'expand': false,
                'collapse': true,
                'w-left': true
            },
            opacity: 0,
            widthProp: this.getWidthProp()
        };
    }

    static defaultProps = {
        show: false,
        enable: true,
        width: 0.75,
        duration: 200,
        region: {
            top: 0,
            bottom: 0,
            left: 0,
            width: 40
        },
        close: () => {}
    }

    render() {
        let styles = style;
        if (style.constructor === Array) {
            styles = style.locals;
        }

        let wrapperClass = [];
        for (let k of Object.keys(this.state.wrapperClass)) {
            if (this.state.wrapperClass[k]) {
                wrapperClass.push(k);
            }
        }

        let widthProp = this.state.widthProp;

        return (
            <div ref="sidebarWrapper"
                className={[styles['sidebar-wrapper'], ...wrapperClass].join(' ')}>

                <div className={styles['sidebar-scroller']}
                    ref="sidebarScroller"
                    style={{paddingLeft: widthProp}}>

                    <div className={styles['sidebar-main']}
                        style={{width: widthProp}}
                        onScroll={this.handleScroll.bind(this)}>
                        {this.props.children}
                    </div>
                    <div className={styles['touch-toggle']}
                        style={{
                            opacity: this.state.opacity,
                            paddingLeft: widthProp
                        }}
                        ref="sidebarToggle"
                        onClick={this.toggleClick.bind(this)}
                    ></div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.clientWidth = clientWidth();
        this.clientHeight = clientHeight();
        this.itsWidth = this.getItsWidth();
        this.zone = this.getZone();
        this.status = this.props.show;
        this.setState({widthProp: this.getWidthProp()});

        document.body.addEventListener('touchstart', this.touchStart.bind(this));
        document.body.addEventListener('touchmove', this.touchMove.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.show === this.status) {
            return;
        }

        this.status = this.watchStatus(nextProps.show);

        if (nextProps.show) {
            this.expand();
        }
        else {
            this.collapse();
        }
    }

    watchStatus(status) {
        let st;
        if (typeof status === 'undefined') {
            st = !this.status;
        }
        else {
            st = status;
        }

        if (!st) {
            this.props.close();
        }

        return st;
    }

    getItsWidth() {
        let width = this.props.width;
        return width < 1
            ? Math.round(width * this.clientWidth)
            : width;
    }

    getWidthProp() {
        return this.itsWidth + 'px';
    }

    getZone() {
        let {top, right, bottom, left, width, height} = this.props.region;
        let clientWidth = this.clientWidth;
        let clientHeight = this.clientHeight;

        return {
            top: top === undefined
                ? (clientHeight - bottom - height)
                : top,
            left: left === undefined
                ? (clientWidth - right - width)
                : left,
            width: width === undefined
                ? (clientWidth - left - right)
                : width,
            height: height === undefined
                ? (clientHeight - top - left)
                : height
        };
    }

    /**
     * 用于记录 touch 初始位置
     *
     * @param {Event} e 原生事件对象
     */
    touchStart(e) {
        if (this.state.wrapperClass.expand) {
            return;
        }

        if (!this.props.enable) {
            return;
        }

        let {clientX, clientY} = e.touches[0];
        let {left, top, width, height} = this.zone;

        if (clientX < left
            || clientX > left + width
            || clientY < top
            || clientY > top + height
        ) {
            return;
        }

        this.scrollEnable = true;
        this.startX = clientX;
        this.startY = clientY;
    }

    /**
     * 用于判断当前滑动距离和方向是否满足触发 sidebar 侧滑
     *
     * @param {Event} e 原生事件对象
     */
    touchMove(e) {
        if (!this.scrollEnable) {
            return;
        }

        let {clientX, clientY} = e.touches[0];
        let x = clientX - this.startX;

        // 只有当滑动距离大于 5 像素
        // 同时滑动角度小于 30° 时，触发 sidebar 侧滑
        if (x > 5 && Math.abs(clientY - this.startY) / x < 0.577) {
            this.setState({
                wrapperClass: {
                    expand: true,
                    collapse: false
                }
            }, () => {
                this.bindScroll(e);
            });
        }
    }

    /**
     * 点击 sidebar 阴影部分收起 sidebar
     *
     * @param {Event} e 原生点击事件
     */
    toggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.watchStatus(false);
    }

    /**
     * 绑定 iscroll
     *
     * @param {Event} e 原生 touchmove 事件对象
     */
    bindScroll(e) {
        if (this.iscroll) {
            return;
        }

        // 初始化 iscroll
        this.iscroll = new IScroll(
            this.refs.sidebarWrapper,
            {
                eventPassthrough: true,
                scrollY: false,
                scrollX: true,
                bounce: false,
                startX: -this.itsWidth
            }
        );

        this.iscroll.on('scrollEnd', () => {
            let {directionX, x} = this.iscroll;
            // 完全展开的时候 showStatus 状态变为 true
            if (x === 0) {
                this.watchStatus(true);
            }
            // 完全收起的时候 showStatus 状态变为 false 同时解绑 iscroll
            else if (x === -this.itsWidth) {
                this.watchStatus(false);
            }
            // 滑到一半的情况 就根据其不同的滑动状态去补完剩余操作
            else if (directionX > 0) {
                this.watchStatus(false);
            }
            else if (directionX < 0) {
                this.watchStatus(true);
            }
            else {
                this.watchStatus();
            }
        });

        // 触发蒙层的透明度计算
        this.changeOpacity();
        // 将原生事件对象透传给 iscroll 使其在初始化完成后立马实现滚动
        e && this.iscroll._start(e);
    }

    /**
     * 展开侧边栏
     */
    expand() {
        this.setState({
            wrapperClass: {
                expand: true,
                collapse: false
            }
        }, () => {
            
            // 得等到 wrapper 的 class 改变生效，才能去做下一步的绑定操作
            if (!this.iscroll) {
                this.bindScroll();
            }

            if (this.iscroll.x < 0) {
                // 部分机型在 iscroll 初始化完成后立即执行 scrollTo 会有问题
                // 用 nextTick 无效
                setTimeout(() => {
                    this.iscroll && this.iscroll.scrollTo(0, 0, this.props.duration);
                }, 10);
            }
        });
    }

    /**
     * 收起侧边栏
     */
    collapse() {
        if (!this.iscroll) {
            return;
        }
        if (this.iscroll.x === -this.itsWidth) {
            this.unbindScroll();
        }
        else {
            // 解决部分机型在调用 scrollTo 完成的时候 不会触发 scrollEnd 事件的 bug
            setTimeout(() => {
                this.iscroll.scrollTo(-this.itsWidth, 0, this.props.duration);
            });
            // 滚动结束后解绑 iscroll
            setTimeout(() => {
                this.unbindScroll();
            }, this.props.duration + 10);
        }
    }

    /**
     * 解绑并销毁 iscroll
     */
    unbindScroll() {
        if (!this.iscroll) {
            return;
        }
        // 销毁 iscroll
        this.iscroll.destroy();
        this.iscroll = null;
        // 清除各项数值
        this.scrollEnable = false;
        this.setState({
            wrapperClass: {
                expand: false,
                collapse: true
            },
            opacity: 0
        });
        // 去掉 iscroll 遗留下的 style
        this.refs.sidebarScroller.setAttribute(
            'style',
            `padding-left:${this.state.widthProp}`
        );
    }

    /**
     * 触发 mask 的透明度改变
     */
    changeOpacity() {
        if (this.state.wrapperClass.expand && this.iscroll) {
            this.setState({
                opacity: (this.iscroll.x + this.itsWidth) / this.itsWidth * 0.5
            });
            rAF(this.changeOpacity.bind(this));
        }
    }

    handleScroll = (e) => {
        e.stopPropagation();
    }
};
