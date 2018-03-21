
export function showSidebar() {
    return {
        type: 'SHOW_SIDEBAR'
    };
};

export function hideSidebar() {
    return {
        type: 'HIDE_SIDEBAR'
    };
};

export function switchStealthMode(mode) {
    return {
        type: 'SWITCH_Stealth_MODE',
        mode
    };
};
