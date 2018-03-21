import React, {Component} from 'react';
import ProgressBar from '@/components/ProgressBar';
import {matchRoutes} from 'react-router-config';
import {Route, withRouter} from 'react-router-dom';

@withRouter
class AsyncDataLoader extends Component {
    state = {
        previousLocation: this.props.location,
        loading: false
    }

    async componentWillMount() {
        await this.doBeforeEnter(this.props);
    }

    async componentWillReceiveProps(nextProps) {
        // 只有切换路由会启用 before hook + 更新暂存
        if (nextProps.location !== this.props.location) {
            this.setState({
                previousLocation: this.props.location
            });

            await this.doBeforeEnter(nextProps);
        }
    }

    render() {
        const {children, location} = this.props;
        const {previousLocation} = this.state;

        return (<React.Fragment>
                    <ProgressBar loading={this.state.loading} />
                    <Route
                        location={previousLocation || location}
                        render={() => children}
                    />
                </React.Fragment>);
    }

    async doBeforeEnter(props) {
        let {location, routes, dispatch, actions, states} = props;
        let matchedRoutes = matchRoutes(routes, location.pathname);

        this.setState({
            loading: true
        });

        if (matchedRoutes && matchedRoutes.length) {
            await Promise.all(matchedRoutes.map(({route}) => {
                return route.asyncData
                    ? route.asyncData({
                        dispatch: dispatch,
                        states: states,
                        actions: actions,
                        url: location.pathname
                    })
                    : Promise.resolve(null);
            }));
        }

        this.setState({
            loading: false,
            previousLocation: null
        });
    }
}

export default AsyncDataLoader;
