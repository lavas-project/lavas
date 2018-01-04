/**
 * @file english
 * @author mj(zoumiaojiang)
 */

const chalk = require('chalk');

module.exports = {
    LANG: 'en',
    WELECOME: `Welcome to ${chalk.green('Lavas')} solution `,
    GREETING_GUIDE: 'Start a new Lavas PWA project ',
    INIT_SUCCESS: 'The project has been created successfully ',
    INIT_NEXT_GUIDE: 'You can type the following commands to quickly start ',
    LOADING_FROM_CLOUD: 'Downloading, please wait a moment ',
    LOADING_EXPORT_PROJECT: 'Exporting project ',
    SAMA_NAME_ENSURE: 'A project of the same name already exists, cover it ',
    UPDATE_TIPS: 'Lavas have a new version，you can use `npm update -g lavas` command to update! ',
    NO_GIT_COMMAND: 'Lavas commander require `git` ',
    NO_GIT_COMMOND_SUG: 'Please confirm whether to install `git` ',
    NETWORK_DISCONNECT: 'Create a project need to download the template from cloud ',
    NETWORK_DISCONNECT_SUG: 'Please check the current network ',
    DOWNLOAD_TEMPLATE_ERROR: 'Download Lavas template error, please check the current network ',
    META_TEMPLATE_ERROR: 'Getting template meta information error ',
    RENDER_TEMPLATE_ERROR: 'Lavas template rendering error ',
    SHOW_VERSION: 'Check the current version ',
    NO_COMMAND: 'Command does not exist ',
    PLEASE_SEE: 'Please check ',
    START_BUILD: 'Start building ',
    START_DEV: 'Start Lavas development environment server ',
    START_PROD: 'Start Lavas production environment server ',
    START_DEV_SERVER: 'Launching Lavas debug server ',
    START_PROD_SERVER: 'Launching Lavas production server ',
    START_PORT: 'Specify a port ',
    START_SCRIPT: 'Specify the development environment server-side script ',
    START_NO_FILE: 'There is no file in project root path - ',
    BUILD_DESC: 'Build Lavas projects for the production environment ',
    INIT_DESC: 'Initialize Lavas PWA project ',
    INIT_OPTION_FORCE: 'Whether to overwrite existing project ',
    PLEASE_INPUT: 'Please enter ',
    PLEASE_SELECT: 'Please select one ',
    PLEASE_SELECT_DESC: 'Press up and down key to select',
    PLEASE_INPUT_RIGHR_NUM: 'Please enter the correct number ',
    PLEASE_INPUT_NUM: 'Please enter the number',
    PLEASE_INPUT_NUM_DESC: 'Please select a number to specify ',
    INPUT_INVALID: 'Input invalid '
};
