import React, {Component} from 'react';
import '@/assets/css/main.css';
import styles from '@/assets/stylus/skeleton.styl';

export default function Skeleton() {
    return (
        <React.Fragment>
            <header className={styles.skeletonHeader}>
                <div className={styles.iconBlock}>
                    <span className="material-icons">menu</span>
                </div>
                <div style={{
                    flex: 1,
                    fontSize: '1.2em'
                }}>Lavas</div>
                <div className={styles.iconBlock}>
                    <span className="material-icons">search</span>
                </div>
            </header>
            <section className={styles.skeletonBody}>
                <div className={styles.placeholder} style={{
                    height: '52px',
                    width: '140px'
                }}></div>
            </section>
        </React.Fragment>
    );
}
