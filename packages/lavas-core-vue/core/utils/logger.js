import chalk from 'chalk';
import ora from 'ora';

const LOG = {
    DEBUG: {
        LEVEL: 3,
        COLOR: chalk.green
    },
    INFO: {
        LEVEL: 2,
        COLOR: chalk.green
    },
    WARN: {
        LEVEL: 1,
        COLOR: chalk.yellow
    },
    ERROR: {
        LEVEL: 0,
        COLOR: chalk.red
    }
};
const DEFAULT_OPTIONS = {
    level: LOG.INFO.LEVEL,
    textColor: chalk.white
};

class Logger {
    constructor(options) {
        this.options = options;
        this.spinner = null;
    }

    log(tag, content, chalkFunc, update, done) {
        let chalkedContent = chalkFunc.bold(`[Lavas ${tag}] `) + this.options.textColor(content);
        if (update) {
            if (!this.spinner) {
                this.spinner = ora(chalkedContent).start();
            }
            else {
                this.spinner.succeed(chalkedContent);
                this.spinner = null;
            }
        }
        else {
            console.log(chalkedContent);
        }
    }

    debug(tag, content, update, done) {
        if (this.options.level < LOG.DEBUG.LEVEL) {
            return;
        }
        this.log(tag, content, LOG.DEBUG.COLOR, update, done);
    }

    info(tag, content, update, done) {
        if (this.options.level < LOG.INFO.LEVEL) {
            return;
        }
        this.log(tag, content, LOG.INFO.COLOR, update, done);
    }

    warn(tag, content, update, done) {
        if (this.options.level < LOG.WARN.LEVEL) {
            return;
        }
        this.log(tag, content, LOG.WARN.COLOR, update, done);
    }

    error(tag, content, update, done) {
        if (this.options.level < LOG.ERROR.LEVEL) {
            return;
        }
        this.log(tag, content, LOG.ERROR.COLOR, update, done);
    }
}

export default new Logger(DEFAULT_OPTIONS);
