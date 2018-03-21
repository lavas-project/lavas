import React, {Component} from 'react';
// import onEnter from '@/components/OnEnter';
// import Loading from '@/components/Loading';

// @onEnter
class Page1 extends Component {
    render() {
        return (
            <div>
                inpage1
            </div>
        );
    }

    async asyncData() {
        console.log('start fetching data...')
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
        console.log('finish fetching data ...')
    }

    componentWillMount() {
        console.log('page1 mount')

        const {setAppHeader} = this.props;
        setAppHeader({show: true, showBack: true, showMenu: false});
    }

    componentWillUnmount() {
        console.log('page1 unmount')
    }
}

export default Page1;
