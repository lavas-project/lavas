/**
 * to 如果在这个列表中，始终采用从左到右的滑动效果，首页比较适合用这种方式
 * 请填写完整路径，如 /、/x/_id/y
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_BACK_PAGE = ['/'];

/**
 * to 如果在这个列表中，始终采用从右到左的滑动效果
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_FORWARD_PAGE = [];

/**
 * 历史记录，记录访问过的页面的 pathname
 *
 * @type {Array.<string>}
 */
let HISTORY_STACK = [];

/**
 * 用于存储历史记录到localStorage的key
 *
 * @type {String}
 * @const
 */
const LAVAS_HISTORY_ARRAY_STACK_LOCAL_KEY = 'LAVAS_HISTORY_ARRAY_STACK_LOCAL_KEY';

/**
 * 用于存储历史state记录到localStorage的key
 *
 * @type {String}
 * @const
 */
const LAVAS_HISTORY_STATE_STACK_LOCAL_KEY = 'LAVAS_HISTORY_STATE_STACK_LOCAL_KEY';

/**
 * 使用history API记录的state数组
 *
 * @type {Array}
 */
let HISTORY_STATE_STACK = [];

let supportHistory = false;

if (process.env.REACT_ENV === 'client') {

    // 是否支持history
    supportHistory = window.history && 'state' in history;

}

// react-router 里面没有 hook，也没有(默默)拦截路由跳转获取 to、from 的操作，我们只能自己记录
let routes = [];
export function setRoute(route) {
    if (routes.length === 1 && route === routes[0] || routes.length === 2 && route === routes[1]) {
        return;
    }
    if (routes.length === 2) {
        routes.shift();
    }
    routes.push(route);
};

// 存储数据到本地
function saveHistoryToLocal(key, data) {
    try {
        localStorage.setItem(key, typeof data === 'object' ? JSON.stringify(data) : data);
    }
    catch (err) {

    }
}

// 初始化history state
function initHistoryStateStack() {
    // 如果当前tab有历史条目，那么应该把之前存储的state list读取出来
    if (history.length > 1) {
        try {
            let historyState = JSON.parse(localStorage.getItem(LAVAS_HISTORY_STATE_STACK_LOCAL_KEY));
            if (historyState && historyState.length) {
                // 为了有效控制localStorage大小，每次读取时应该只读取不大于当前tab历史条目长度
                // 因为大于历史条目长度之前的记录都是过期的state，无需读取
                HISTORY_STATE_STACK = historyState.slice(-history.length);
            }
        }
        catch (err) {

        }
    }

    // 首次访问的页面也要加入列表中，但要注意如果当前页面访问过（刷新）则应该替换
    if (HISTORY_STATE_STACK.length) {
        HISTORY_STATE_STACK[HISTORY_STATE_STACK.length - 1] = history.state.key;
    }
    else {
        HISTORY_STATE_STACK.push(history.state.key);
    }

}

// 初始化history array
function initHistoryArrayStack(routerBase) {

    let firstPagFullPathe = location.href.replace(location.origin + routerBase, '/');

    try {
        // 如果localStorage中有历史访问记录，且最新一条和当前访问的是同一个页面
        // 那应该把之前的记录也加进来，主要解决在访问过程中刷新导致history列表丢失的问题
        let historyStack = JSON.parse(localStorage.getItem(LAVAS_HISTORY_ARRAY_STACK_LOCAL_KEY));
        if (
            historyStack
            && historyStack.length
            && historyStack[historyStack.length - 1] === firstPageFullPath
        ) {
            HISTORY_STACK = historyStack;
        }
    }
    catch (err) {

    }

    // 首次访问的页面也要加入列表中
    if (HISTORY_STACK.indexOf(firstPageFullPath) === -1) {
        HISTORY_STACK.push(firstPageFullPath);
    }
}

/**
 * 用path记录判断当前是否是前进，true 表示是前进，否则是回退
 *
 * @param {Object} to 目标 route
 * @param {Object} from 源 route
 * @return {boolean} 是否表示返回
 */
function isForwardByArray(to, from) {

    // 根据 pathname 判断当前页面是否访问过，如果访问过，则属于返回

    let index = HISTORY_STACK.indexOf(to.pathname);
    if (index !== -1) {

        HISTORY_STACK.length = index + 1;
        return false;
    }

    return true;

}

/**
 * 用history state判断当前是否是前进，true 表示是前进，否则是回退
 *
 * @return {boolean} 是否表示返回
 */
function isForwardByHistory() {

    // 如果访问的页面state和之前访问过的页面相同，则属于返回

    let index = HISTORY_STATE_STACK.indexOf(history.state && history.state.key || '');

    if (index !== HISTORY_STATE_STACK.length - 1 && index !== -1) {
        HISTORY_STATE_STACK.length = index + 1;
        return false;
    }

    return true;
}

function trim(str) {
    return str.replace(/^\s*|\s*$/g, '');
}

function reform(str) {
    let arr = trim(str).split('/');
    let indexArr = [];
    let initialLen = 0;

    if (arr[0].length) {
        arr.unshift('');
    }
    initialLen = arr.length;

    arr = arr.filter((val, i) => {
        if (/^_/.test(val)) {
            indexArr.push(i);
            return false;
        }
        return true;
    });

    return {
        len: initialLen,
        indexArr,
        path: arr.join('/')
    }
}
let alwaysBackPage = [];
let alwaysForwardPage = [];

for (let path of ALWAYS_BACK_PAGE) {
    alwaysBackPage.push(reform(path));
}
for (let path of ALWAYS_FORWARD_PAGE) {
    alwaysForwardPage.push(reform(path));
}

function reformExtra(pathChunks, indexArr) {
    return pathChunks.filter((val, i) => indexArr.indexOf(i) === -1).join('/');
}

/**
 * 判断当前是否是前进，true 表示是前进，否则是回退
 *
 * @param {Object} to 目标 route
 * @param {Object} from 源 route
 * @return {boolean} 是否表示返回
 */
export function isForward(to = routes[1], from = routes[0]) {

    if (to && from && to.pathname === from.pathname) {
        return -1;
    }

    if (routes.length === 1) {
        to = from;
    }

    let res = true;

    // 使用history判断
    if (supportHistory) {
        res = isForwardByHistory();

        // 存储至localStorage
        setTimeout(() => {
            // 如果页面没访问过则把state加进来
            let pageKey = history.state && history.state.key || '';
            let index = HISTORY_STATE_STACK.indexOf(pageKey);
            if (res && index === -1) {

                HISTORY_STATE_STACK.push(pageKey);
            }

            saveHistoryToLocal(LAVAS_HISTORY_STATE_STACK_LOCAL_KEY, HISTORY_STATE_STACK);
        }, 300);
    }
    // 使用array判断
    else {
        res = isForwardByArray(to, from);

        if (res) {
            // 将 to.pathname 加到栈顶
            HISTORY_STACK.push(to.pathname);
        }

        saveHistoryToLocal(LAVAS_HISTORY_ARRAY_STACK_LOCAL_KEY, HISTORY_STACK);
    }

    // 以下属于强行更改方向系列
    // to 如果在这个列表中，始终认为是后退
    let toPaths = trim(to.pathname).split('/');
    let toPathLen = toPaths.length;
    for (let path of alwaysBackPage) {
        if (path.len === toPathLen && reformExtra(toPaths, path.indexArr) === path.path) {
            res = false;
        }
    }
    // 如果在这个列表中，始终认为是前进
    for (let path of alwaysForwardPage) {
        if (path.len === toPathLen && reformExtra(toPaths, path.indexArr) === path.path) {
            res = true;
        }
    }

    return res;
};
