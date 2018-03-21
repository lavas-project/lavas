import React from 'react';
import style from './AppHeader.styl';
import IconButton from 'material-ui/IconButton';
export default class AppHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    static defaultProps = {
        click: () => {}
    }

    render() {
        let styles = style;
        if (style.constructor === Array) {
            styles = style.locals;
        }

        const {show, showMenu, showBack, showLogo, logoIcon, title, actions} = this.props;
        let appHeader = '';
        let iconMenu;
        let iconBack;
        let iconLogo;
        let iconActions

        if (showMenu) {
            iconMenu = <IconButton
                iconClassName="material-icons"
                className={styles['app-header-icon']}
                onClick={this.handleClick.bind(this, 'menu')}>menu</IconButton>;
        }
        if (showBack) {
            iconBack = <IconButton
                iconClassName="material-icons"
                className={styles['app-header-icon']}
                onClick={this.handleClick.bind(this, 'back')}>arrow_back</IconButton>;
        }
        if (showLogo) {
            let logoImg;
            if (logoIcon && logoIcon.src) {
                logoImg = <img src={logoIcon.src} alt={logoIcon.alt} 
                    className={styles['app-header-icon']} />
            }
            iconLogo = <div onClick={this.handleClick.bind(this, 'logo')}>{logoImg}</div>;
        }
        if (actions && actions.length) {
            iconActions = actions.map((action, actionIdx) =>
                <IconButton key={actionIdx}
                    iconClassName="material-icons"
                    className={styles['app-header-icon']}
                    onClick={this.handleClick.bind(this, 'action', {actionIdx, route: action.route})}>
                    {action.icon}
                </IconButton>
            );
        }
        if (show) {
            appHeader = <header className={styles['app-header-wrapper']}>
                <div className={styles['app-header-left']}>
                    {iconMenu}
                    {iconBack}
                    {iconLogo}
                </div>
                <div className={styles['app-header-middle']}>
                    {title}
                </div>
                <div className={styles['app-header-right']}>
                    {iconActions}
                </div>
            </header>;
        }

        return appHeader;
    }

    /**
     * 处理按钮点击事件
     *
     * @param {string} source 点击事件源名称 menu/logo/action
     * @param {Object} data 随点击事件附带的数据对象
     */
    handleClick(source, {actionIdx, route} = {}) {
        // // 页面正在切换中，不允许操作，防止滑动效果进行中切换
        // if (this.isPageSwitching) {
        //     return;
        // }
        let eventData = {
            eventName: `click-${source}`,
            data: {}
        };

        // 点击右侧动作按钮，事件对象中附加序号
        if (source === 'action') {
            eventData.data.actionIdx = actionIdx;
        }
        // 如果传递了路由对象，进入路由
        if (route) {
            eventData.data.route = route;
        }

        // 发送给父组件，内部处理
        this.props.click(eventData);

        // // 发送全局事件，便于非父子关系的路由组件监听
        // EventBus.$emit(`app-header:click-${source}`, eventData);
    }
};
