import React, {Component} from 'react';
import {Provider, connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Route, withRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import PageTransition from '@/components/PageTransition';

import actions from '@/core/actions';

import style from '@/assets/stylus/app.styl';
import '@/assets/css/main.css';

const muiTheme = getMuiTheme({
    primaryColor: '#1976d2'
});

// 基于全局的 state 输出需要的 state
function mapStateToProps(state) {
    return state;
}

@withRouter
@connect(mapStateToProps)
class Appshell extends Component {

    render() {
        let styles = style;
        if (style.constructor === Array) {
            styles = style.locals;
        }

        const {
            route,
            store,
            location,
            dispatch,
            appHeader, appSidebar, pageTransition
        } = this.props;
        const boundActionCreators = bindActionCreators(actions, dispatch);

        return (
            <Provider store={store}>
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div className={styles.app}>
                        <PageTransition location={location} pageTransition={pageTransition}>
                            <div className={[
                                styles['app-view'],
                                (appHeader.show ? styles['app-view-with-header'] : ''),
                                styles[`transition-${pageTransition.effect}`]
                            ].join(' ')}>
                                <AppHeader click={this.handleClick.bind(this)} {...appHeader} />
                                <AppSidebar close={this.handleSidebarClose.bind(this)} {...appSidebar}></AppSidebar>
                                {renderRoutes(route.routes, {...boundActionCreators})}
                            </div>
                        </PageTransition>
                    </div>
                </MuiThemeProvider>
            </Provider>
        );
    }

    handleClick(eventData) {
        let {eventName, data} = eventData;
        eventName = eventName.replace(/-(\w)/, (m1, m2) => {
            return m2.toUpperCase();
        });
        this[eventName] && this[eventName](data);
    }

    clickMenu() {
        this.props.dispatch(actions.showSidebar());
    }

    clickBack() {
        this.props.history.go(-1);
    }

    clickAction(data) {
        if (data.route) {
            this.props.history.push(data.route);
        }
    }

    handleSidebarClose() {
        this.props.dispatch(actions.hideSidebar());
    }

    handleBeforeEnter() {

    }

    handleAfterEnter() {

    }

}

export default Appshell;
