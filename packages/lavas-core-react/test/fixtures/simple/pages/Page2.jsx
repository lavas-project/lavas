import React, {Component} from 'react';
import { renderRoutes } from 'react-router-config'

class Page2 extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <p onClick={this.click.bind(this)}>inpage2 outer</p>
                {renderRoutes(this.props.routes)}
            </div>
        );
    }

    componentDidMount() {
        console.log('page2 mount')

        const {setAppHeader} = this.props;
        setAppHeader({show: true, showBack: true, showMenu: false});
    }

    click() {
        this.props.history.push('/');
    }
}

export default Page2;
