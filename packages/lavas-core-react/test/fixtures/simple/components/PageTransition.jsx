import React, {Component} from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {setRoute, isForward} from '@/core/router';

const childFactoryCreator = (classNames) => (
    (child) => (
        React.cloneElement(child, {
            classNames
        })
    )
);

export default class PageTransition extends Component {

    render() {
        let {pageTransition, location, children} = this.props;
        let doSlide = false;
        let type = pageTransition.type;
        let factor;

        setRoute(location);

        if (pageTransition.enable && pageTransition.effect === 'slide') {
            doSlide = true;
            let forward = isForward();

            if (forward !== -1) {
                type = `slide-${forward ? 'left' : 'right'}`;
                factor = forward ? 1 : -1;
            }
        }
        return (
            <TransitionGroup
                childFactory={childFactoryCreator(type)}
                component={React.Fragment}>
                <CSSTransition
                    key={location.key}
                    timeout={{ enter: 1000, exit: 1000 }}
                    onEnter={node => {
                        if (doSlide) {
                            // slide-xx-enter 的 css 动画初始状态设置不生效，只能先放在这里，看后面有没有更好的解决方法
                            node.style.transform = `translate(${factor * 100}%, 0)`;
                            node.style.transition = 'transform 1s cubic-bezier(.55, 0, .1, 1)';
                        }
                    }}
                    onEntering={node => {
                        doSlide && (node.style.transform = '');
                    }}
                    onEntered={node => {
                        doSlide && (node.style.transition = '');
                    }}>

                    {children}

                </CSSTransition>
            </TransitionGroup>);
    }
};
