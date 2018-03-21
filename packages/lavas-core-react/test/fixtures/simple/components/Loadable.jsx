import ReactLoadable from 'react-loadable';
import ProgressBar from './ProgressBar';

export default function Loadable(opts) {
    return ReactLoadable(Object.assign({
        loading: ProgressBar,
        delay: 200,
        timeout: 10,
    }, opts));
};
