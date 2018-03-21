import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Helmet} from "react-helmet";
import style from '@/assets/stylus/index.styl';
class Index extends Component {
    static asyncData({dispatch, states, actions, url}) {
        return new Promise((resolve, reject) => {
            console.log('asyncData in index start...')
            setTimeout(() => {
                console.log('asyncData in index ended.')
                resolve();
            }, 4000);
        });
    }

    render() {
        let styles = style;
        if (style.constructor === Array) {
            styles = style.locals;
        }

        return (
            <React.Fragment>
                <Helmet titleTemplate="%s - Lavas">
                    <title>Home</title>
                    <meta name="keywords" content="lavas-react PWA" />
                    <meta name="description" content="基于 React 的 PWA 解决方案，帮助开发者快速搭建 PWA 应用，解决接入 PWA 的各种问题" />
                </Helmet>
                <div className={styles.content}>
                    <div>
                        <h2>LAVAS</h2>
                        <h4>[ˈlɑ:vəz]</h4>
                        <p><Link to="/page1">Page1</Link></p>
                        <p><Link to="/page2">Page2</Link></p>
                        <p><Link to="/nomatch">404</Link></p>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    componentDidMount() {
        this.props.setAppHeader({
            show: true,
            title: 'Lavas',
            showMenu: true,
            showBack: false,
            showLogo: false,
            actions: [
                {
                    icon: 'search',
                    route: '/search'
                }
            ]
        });
    }
};

export default Index;
