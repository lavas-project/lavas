/**
 * @file chinese text
 * @author mj(zoumiaojiang@gmail.com)
 */

const chalk = require('chalk');

module.exports = {
    LANG: 'zh_CN',
    WELECOME: `欢迎使用 ${chalk.green('Lavas')} 解决方案`,
    GREETING_GUIDE: '开始新建一个 Lavas PWA 项目',
    INIT_SUCCESS: '项目已创建成功',
    INIT_NEXT_GUIDE: '您可以操作如下命令快速开始开发 Lavas 工程',
    LOADING_FROM_CLOUD: '正在拉取云端数据，请稍候',
    LOADING_EXPORT_PROJECT: '正在导出工程',
    SAMA_NAME_ENSURE: '存在同名项目，是否覆盖',
    UPDATE_TIPS: 'Lavas 有新的版本更新，您可以通过 `npm update -g lavas` 命令更新版本!',
    NO_GIT_COMMAND: 'Lavas 命令行依赖 git 工具',
    NO_GIT_COMMOND_SUG: '当前环境下没有检测到 git 命令，请确认是否安装 git',
    NETWORK_DISCONNECT: '创建工程需要下载云端模版',
    NETWORK_DISCONNECT_SUG: '请确认您的设备处于网络可访问的环境中',
    DOWNLOAD_TEMPLATE_ERROR: '下载 Lavas 模版出错，请检查当前网络',
    META_TEMPLATE_ERROR: '获取模版 Meta 信息出错',
    RENDER_TEMPLATE_ERROR: 'Lavas 模板渲染出错',
    SHOW_VERSION: '查看当前版本',
    NO_COMMAND: '命令不存在',
    PLEASE_SEE: '请查看',
    START_BUILD: '开始构建',
    START_DEV: '启动 Lavas 开发环境服务器',
    START_PROD: '启动 Lavas 生产环境服务器',
    START_STATIC: '启动 Lavas 静态服务器',
    START_DEV_SERVER: '正在启动 Lavas 调试服务器',
    START_PROD_SERVER: '正在启动 Lavas 正式服务器',
    START_PORT: '指定 port',
    START_SCRIPT: '指定开发环境服务端脚本',
    START_NO_FILE: 'Lavas 没有检测到项目根目录下含有文件',
    BUILD_DESC: '为生产环境构建 Lavas 项目',
    INIT_DESC: '初始化 Lavas PWA 项目',
    INIT_OPTION_FORCE: '是否覆盖已有项目',
    PLEASE_INPUT: '请输入',
    PLEASE_SELECT: '请选择一个',
    PLEASE_SELECT_DESC: '按上下键选择',
    PLEASE_INPUT_RIGHR_NUM: '请输入正确的数字',
    PLEASE_INPUT_NUM: '请输入数字',
    PLEASE_INPUT_NUM_DESC: '请选择一个数字指定',
    INPUT_INVALID: '输入不符合规范',
    START_CONFIG: '指定自定义 lavas.config.js'
};
