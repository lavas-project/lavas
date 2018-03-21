import React, {Component} from 'react';
import {Helmet} from "react-helmet";
import style from '@/assets/stylus/search.styl';
import muiThemeable from 'material-ui/styles/muiThemeable';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import CircularProgress from 'material-ui/CircularProgress';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import {
    grey400, grey900
} from 'material-ui/styles/colors';

class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            query: '',
            loading: false,
            data: null
        };
    }

    render() {
        let styles = style;
        if (style.constructor === Array) {
            styles = style.locals;
        }

        let {loading, data} = this.state;

        return (
            <React.Fragment>
                <Helmet titleTemplate="%s - Lavas">
                    <title>Search</title>
                    <meta name="keywords" content="lavas-react PWA" />
                    <meta name="description" content="基于 React 的 PWA 解决方案，帮助开发者快速搭建 PWA 应用，解决接入 PWA 的各种问题" />
                </Helmet>
                <div className={styles["app-search-page"]}>
                    <header>
                        <IconButton
                            iconClassName="material-icons"
                            className={styles['search-icon']}
                            onClick={this.goBack.bind(this)}>
                            arrow_back
                        </IconButton>
                        <form onSubmit={this.search.bind(this)}>
                            <input ref="searchInput" className={styles["search-input"]} 
                                onInput={this.handleInput.bind(this)} 
                                value={this.state.query}
                                type="text" autoComplete="off" 
                                placeholder="请输入搜索词" autoCapitalize="off" />
                        </form>
                        <IconButton
                            iconClassName="material-icons"
                            className={styles['search-icon']}
                            onClick={this.clearSeachInput.bind(this)}>
                            close
                        </IconButton>
                    </header>
                    {loading &&
                    <div className={styles["search-loading"]}>
                        <CircularProgress size={70} thickness={3}
                            color={this.props.muiTheme.primaryColor} />
                    </div>
                    }
                    {data && data.length &&
                    <div className={styles["search-content"]}>
                        <List>
                            {data.map((item, index) =>
                                <React.Fragment key={index}>
                                    <ListItem
                                        rightIcon={<FontIcon className="material-icons" color={grey400}>star_border</FontIcon>}
                                        primaryText={item.title}
                                        secondaryText={
                                            <p>
                                                <span style={{color: grey900}}>{item.headline}</span><br />
                                                {item.subtitle}
                                            </p>
                                        }
                                        secondaryTextLines={2}
                                    />
                                    {(index + 1 < data.length) && <Divider />}
                                </React.Fragment>
                            )}
                        </List>
                    </div>
                    }
                </div>
            </React.Fragment>
        );
    }

    componentDidMount() {
        this.props.setAppHeader({
            show: false
        });
    }

    goBack() {
        this.props.history.go(-1);
    }

    clearSeachInput() {
        this.setState({query: '' });
    }

    handleInput(evt) {
        this.setState({query: evt.target.value});
    }

    async search(e) {
        e.preventDefault();

        this.setState({
            // 显示加载动画
            loading: true,
            // 把数据清空
            data: null
        });

        // 让当前输入框失去焦点
        this.refs.searchInput.blur();

        try {
            // 等待 1s，模拟加载中的效果
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
        }
        catch (e) {}

        // 设置搜索结果数据
        this.setState({
            loading: false,
            data: [
                {
                    title: 'Ali Connors',
                    headline: 'Brunch this weekend?',
                    subtitle: 'I\'ll be in your neighborhood doing errands this weekend. Do you want to hang out?',
                    action: '15 min'
                },
                {
                    title: 'me, Scrott, Jennifer',
                    headline: 'Summer BBQ',
                    subtitle: 'Wish I could come, but I\'m out of town this weekend.',
                    action: '2 hr'
                },
                {
                    title: 'Sandra Adams',
                    headline: 'Oui oui',
                    subtitle: 'Do you have Paris recommendations? Have you ever been?',
                    action: '6 hr'
                },
                {
                    title: 'Trevor Hansen',
                    headline: 'Birthday gift',
                    subtitle: 'Have any ideas about what we should get Heidi for her birthday?',
                    action: '12 hr'
                },
                {
                    title: 'Britta Holt',
                    headline: 'Recipe to try',
                    subtitle: 'We should eat this: Grate, Squash, Corn, and tomatillo Tacos.',
                    action: '18 hr'
                }
            ]
        });
    }
};

export default muiThemeable()(Search);