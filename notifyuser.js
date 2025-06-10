const _setTimeout = window.setTimeout;
const _clearTimeout = window.clearTimeout;
class ZenNotification {
    constructor() {
        this.styleInjected = false;
        this.notifications = [];
        this.containerMap = new Map();
        this.prefix = 'zn-' + Date.now().toString(36); // Unique prefix
        this.addGlobalStyles();
    }

    addGlobalStyles() {
        if (!this.styleInjected) {
            const style = document.createElement('style');
            style.textContent = `
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        .${this.prefix}-notification-container {
            position: fixed;
            z-index: 9999999999;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: auto;
        }
        .${this.prefix}-notification-container.top-left { 
            top: 20px; 
            left: 20px; 
            align-items: flex-start; 
        }
        .${this.prefix}-notification-container.top-right { 
            top: 20px; 
            right: 20px; 
            align-items: flex-end; 
        }
        .${this.prefix}-notification-container.bottom-left { 
            bottom: 20px; 
            left: 20px; 
            align-items: flex-start; 
        }
        .${this.prefix}-notification-container.bottom-right { 
            bottom: 20px; 
            right: 20px; 
            align-items: flex-end; 
        }
        .${this.prefix}-notification-container.top-center { 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            align-items: center; 
        }
        .${this.prefix}-notification-container.bottom-center { 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            align-items: center; 
        }
        .${this.prefix}-notification-container.center { 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            align-items: center; 
        }
        .${this.prefix}-notification {
            background: rgba(31, 31, 31, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            opacity: 0.95;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            font-family: 'Roboto', sans-serif;
            color: #fff;
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 380px;
            max-width: 90vw;
            word-break: break-word;
            overflow-wrap: break-word;
            pointer-events: auto;
            transform: translateY(20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .${this.prefix}-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        .${this.prefix}-notification-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 1.05rem;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 6px;
        }
        .${this.prefix}-notification-message {
            font-size: 0.95rem;
            line-height: 1.5;
            opacity: 0.85;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            text-align: left;
            max-height: 4.2em;
            overflow: hidden;
            position: relative;
            transition: max-height 0.3s ease;
        }
        .${this.prefix}-notification-message.expanded {
            max-height: 1000px;
        }
        .${this.prefix}-notification-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .${this.prefix}-notification-button {
            flex: 1;
            padding: 8px 12px;
            border-radius: 6px;
            border: none;
            background: #444;
            color: #fff;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .${this.prefix}-notification-button:hover {
            background: #555;
        }
        .${this.prefix}-progress-bar {
            height: 4px;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            overflow: hidden;
            border-radius: 2px;
            position: relative;
        }
        .${this.prefix}-progress-bar-fill {
            height: 100%;
            width: 0%;
            background: #3fe879;
            position: absolute;
            left: 0;
            top: 0;
            will-change: width;
        }
        .${this.prefix}-expand-button {
            background: none;
            color: #3fe879;
            font-size: 0.85rem;
            padding: 0;
            border: none;
            cursor: pointer;
            margin-left: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .${this.prefix}-expand-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
        }
        .${this.prefix}-expand-wrapper:hover .${this.prefix}-expand-button {
            opacity: 1;
        }
        .${this.prefix}-notification-countdown {
            font-size: 0.75rem;
        }
        .${this.prefix}-notification.hide {
            transform: translateY(20px);
            opacity: 0;
            transition: transform 0.3s ease-in, opacity 0.3s ease-in;
        }
        .${this.prefix}-notification.redirect {  border-color: #ed4e59; box-shadow: 0 0 20px rgba(237, 78, 89, 0.4); }
        .${this.prefix}-notification.key {  border-color: #3fe879; box-shadow: 0 0 20px rgba(63, 232, 121, 0.4); }
        .${this.prefix}-notification.error { border-color: #d82b2b; box-shadow: 0 0 20px rgba(216, 43, 43, 0.4); }
        .${this.prefix}-notification.status { border-color: #e87c3f; box-shadow: 0 0 20px rgba(232, 124, 63, 0.4); }
        .${this.prefix}-notification.default { border-color: #4154b0; box-shadow: 0 0 20px rgba(65, 84, 176, 0.4); }
        @media (max-width: 768px) {
            .${this.prefix}-notification {
                width: 90vw;
                font-size: 0.85rem;
                padding: 12px;
            }
            .${this.prefix}-notification-title {
                font-size: 0.95rem;
            }
            .${this.prefix}-notification-message {
                font-size: 0.85rem;
            }
            .${this.prefix}-notification-button {
                font-size: 0.85rem;
                padding: 6px 10px;
            }
        }
        @media (max-width: 480px) {
            .${this.prefix}-notification {
                font-size: 0.8rem;
            }
            .${this.prefix}-notification-title {
                font-size: 0.9rem;
            }
            .${this.prefix}-notification-message {
                font-size: 0.8rem;
            }
            .${this.prefix}-notification-button {
                font-size: 0.8rem;
                padding: 5px 8px;
            }
        }`;
            style.setAttribute('data-zn-style', '');
            document.head.appendChild(style);
            this.styleInjected = true;
        }
    }

    setPosition(position = 'top-right') {
        if (!this.containerMap.has(position)) {
            const container = document.createElement('div');
            container.attachShadow({ mode: 'open' });
            
            const style = document.createElement('style');
            style.textContent = this.generateStyles(); // Move your styles here
            
            const wrapper = document.createElement('div');
            wrapper.className = `${this.prefix}-notification-container ${position}`;
            
            container.shadowRoot.appendChild(style);
            container.shadowRoot.appendChild(wrapper);
            
            document.body.appendChild(container);
            this.containerMap.set(position, container);
        }
        this.container = this.containerMap.get(position);
    }

    renderMessage(html) {
        const div = document.createElement('div');
        div.classList.add(`${this.prefix}-notification-message`);
        div.innerHTML = html;
        return div;
    }

    addExpandButton(messageElement) {
        requestAnimationFrame(() => {
            const lineHeight = parseFloat(getComputedStyle(messageElement).lineHeight) || 20;
            const lines = Math.round(messageElement.scrollHeight / lineHeight);
            if (lines > 3) {
                const wrapper = document.createElement('div');
                wrapper.className = `${this.prefix}-expand-wrapper`;

                const toggleBtn = document.createElement('button');
                toggleBtn.className = `${this.prefix}-expand-button`;
                toggleBtn.innerHTML = '▼';
                toggleBtn.addEventListener('click', () => {
                    messageElement.classList.toggle('expanded');
                    toggleBtn.innerHTML = messageElement.classList.contains('expanded') ? '▲' : '▼';
                });

                messageElement.parentNode.insertBefore(wrapper, messageElement.nextSibling);
                wrapper.appendChild(messageElement);
                wrapper.appendChild(toggleBtn);
            }
        });
    }

    notify(title, message, timeout = 5000, options = {}) {
        this.ensureDependencies();
        const { type = 'default', buttons = [], countdown = false, countdownText = `Dismissing in {time}s`, position = 'top-right', showProgress = false } = options;
        this.setPosition(position);
        let autoTimeoutId;
        let resolvePromise;
        const onClosePromise = new Promise(resolve => {
            resolvePromise = resolve;
        });
        const notification = document.createElement('div');
        notification.className = `${this.prefix}-notification ${type}`;
        const titleElement = document.createElement('div');
        titleElement.classList.add(`${this.prefix}-notification-title`);
        titleElement.innerHTML = `<i class="fas ${this.getIconClass(type)}"></i> ${title}`;
        notification.appendChild(titleElement);
        const messageElement = document.createElement('div');
        messageElement.classList.add(`${this.prefix}-notification-message`);
        messageElement.textContent = message;
        notification.appendChild(messageElement);
        const expandBtn = this.addExpandButton(messageElement);
        if (expandBtn) notification.appendChild(expandBtn);
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add(`${this.prefix}-notification-buttons`);
        this.createButtons(buttonContainer, buttons.slice(0, 2), notification, () => resolvePromise());
        if (buttons.length) notification.appendChild(buttonContainer);
        if (showProgress && timeout !== null) {
            const progressBar = document.createElement('div');
            progressBar.classList.add(`${this.prefix}-notification-bar`);
            const fill = document.createElement('div');
            fill.classList.add(`${this.prefix}-notification-bar-fill`);
            fill.style.transition = `width ${timeout}ms linear`;
            progressBar.appendChild(fill);
            notification.appendChild(progressBar);
            this.container.appendChild(notification);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    fill.style.width = '100%';
                });
            });
        }
        this.container.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));
        if (countdown && timeout !== null) {
            const countdownElement = document.createElement('div');
            countdownElement.classList.add(`${this.prefix}-notification-countdown`);
            notification.appendChild(countdownElement);
            this.startCountdown(countdownElement, timeout, countdownText, notification, () => resolvePromise());
        } else if (timeout !== null) {
            autoTimeoutId = _setTimeout(() => {
                this.removeNotification(notification, () => resolvePromise());
            }, timeout);
        }
        return {
            element: notification,
            close: () => {
                _clearTimeout(autoTimeoutId);
                this.removeNotification(notification, () => resolvePromise());
            },
            onClosed: async () => {
                await onClosePromise;
            }
        };
    }

    single(message, timeout = 5000, options = {}) {
        this.ensureDependencies();
        const { type = 'default', position = 'top-center' } = options;
        this.setPosition(position);
        let autoTimeoutId;
        let resolvePromise;
        const onClosePromise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        const notification = document.createElement('div');
        notification.className = `${this.prefix}-notification ${type}`;
        notification.style.padding = '10px 20px';
        notification.style.gap = '0';
        notification.style.flexDirection = 'row';

        const messageElement = document.createElement('div');
        messageElement.classList.add(`${this.prefix}-notification-message`, `${this.prefix}-single-notification-message`);
        messageElement.textContent = message;
        notification.appendChild(messageElement);

        this.container.appendChild(notification);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
        });

        if (timeout !== null) {
            autoTimeoutId = setTimeout(() => {
                this.removeNotification(notification, () => resolvePromise());
            }, timeout);
        }

        return {
            element: notification,
            close: () => {
                clearTimeout(autoTimeoutId);
                this.removeNotification(notification, () => resolvePromise());
            },
            onClosed: async () => {
                await onClosePromise;
            }
        };
    }

    cleanup() {
        Array.from(document.querySelectorAll(`[data-zn-style]`)).forEach(el => el.remove());
        this.containerMap.forEach(container => container.remove());
        this.containerMap.clear();
        this.styleInjected = false;
    }

    ensureDependencies() {
        if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        if (!document.querySelector('link[href*="fontawesome.com"]')) {
            const faLink = document.createElement('link');
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            faLink.rel = 'stylesheet';
            document.head.appendChild(faLink);
        }
    }

    getIconClass(type) {
        switch (type) {
            case 'redirect': return 'fa-external-link-alt';
            case 'key': return 'fa-key';
            case 'error': return 'fa-exclamation-circle';
            case 'status': return 'fa-check-circle';
            default: return 'fa-info-circle';
        }
    }

    createButtons(container, buttonsConfig, notificationElement, resolve) {
        buttonsConfig.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.classList.add(`${this.prefix}-notification-button`, ...(button.className ? button.className.split(' ') : []));
            btn.addEventListener('click', () => {
                if (button.onClick) button.onClick(this, btn, notificationElement);
            });
            container.appendChild(btn);
        });
    }

    async startCountdown(element, timeout, text, notification, resolve) {
        let remainingTime = Math.ceil(timeout / 1000);
        text = text || "Dismissing in {time}s";
        const notificationData = { element: notification, timeoutId: Symbol("manualCountdown") };
        this.notifications.push(notificationData);
        const currentId = notificationData.timeoutId;
        element.textContent = text.replace(`{time}`, remainingTime);
        const sleep = (ms) => new Promise(r => _setTimeout(r, ms));
        while (remainingTime > 0 && notificationData.timeoutId === currentId) {
            await sleep(1000);
            remainingTime--;
            element.textContent = text.replace(`{time}`, remainingTime);
        }
        if (notificationData.timeoutId === currentId) {
            this.removeNotification(notification, resolve);
        }
    }

    removeNotification(notificationElement, resolve) {
        if (!notificationElement) {
            if (resolve) resolve();
            return;
        }

        notificationElement.classList.remove('show');
        notificationElement.classList.add('hide');

        const handleTransitionEnd = () => {
            notificationElement.removeEventListener('transitionend', handleTransitionEnd);
            notificationElement.remove(); 
            this.notifications = this.notifications.filter(n => n.element !== notificationElement);
            if (resolve) resolve();
        };

        notificationElement.addEventListener('transitionend', handleTransitionEnd);

        _setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
                this.notifications = this.notifications.filter(n => n.element !== notificationElement);
                if (resolve) resolve();
            }
        }, 350);
    }
}

var zennify;
window.addEventListener("DOMContentLoaded", function(event) {
    if (window.zennify) {
        zennify.cleanup();
    }
    zennify = new ZenNotification();
});

function copyButton(textToCopy) {
    const sleep = (ms) => new Promise(r => _setTimeout(r, ms));
    textToCopy = textToCopy.trim();
    return {
        text: "Copy",
        onClick: async (instance, element, notification) => {
            const originalText = element.textContent;
            GM_setClipboard(textToCopy);
            element.textContent = "Copied";
            await sleep(1000);
            element.textContent = originalText;
        }
    }
}

function redirectButton(url, customText = "Go to link") {
    return { text: customText, onClick: () => { window.location.href=url; }}
}

function buttonsHandle(data) {
    function isValidURL(urlString) {
        try {
            const url = new URL(urlString);
            const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:';
            const hasValidHostname = url.hostname && url.hostname !== '';
            const isNotSpecialScheme = !['javascript:', 'data:', 'mailto:', 'tel:', 'blob:'].includes(url.protocol);
            const hasCorrectStructure = url.pathname === '/' || url.pathname.startsWith('/') && !url.pathname.startsWith('//');
            return isWebProtocol && hasValidHostname && isNotSpecialScheme && hasCorrectStructure;
        } catch (e) {
            return false;
        }
    }
    const buttons = [copyButton(data)];
    if (isValidURL(data)) {
        buttons.push(redirectButton(data))
    } else {
        buttons.push({
            text:"Close",
            className: "close-button",
            onClick: (instance, element, notification) => {
                instance.removeNotification(notification, () => {});
            }
        });
    }
    return buttons;
}

function keyNotification(config, key, customText = 'Got Key') {
    zennify.notify(customText, key, null, {
        type: "key",
        buttons: [
            copyButton(key)
        ],
    });
    if (config) {
        GM_setClipboard(key);
        zennify.single(`${customText.includes("Key") ? "Key" : "Paste"} has been copied to your clipboard.`, 10000, {type:"key",position:"top-right"})
    }
}

async function redirectNotification(config, url) {
    const sleep = (ms) => new Promise(r => _setTimeout(r, ms));
    function isValidURL(urlString) {
        try {
            const url = new URL(urlString);
            const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:';
            const hasValidHostname = url.hostname && url.hostname !== '';
            const isNotSpecialScheme = !['javascript:', 'data:', 'mailto:', 'tel:', 'blob:'].includes(url.protocol);
            const hasCorrectStructure = url.pathname === '/' || url.pathname.startsWith('/') && !url.pathname.startsWith('//');
            return isWebProtocol && hasValidHostname && isNotSpecialScheme && hasCorrectStructure;
        } catch (e) {
            return false;
        }
    }
    const isURL = isValidURL(url);
    const enabled = config.enabled && isURL;
    const wait = enabled ? config.wait * 1000 : null;
    zennify.notify("Bypassed Result", url, wait, {
        type:"key", buttons: buttonsHandle(url), countdown: enabled ? true : false, countdownText: "Please wait while we redirect you in {time}s"
    })
    if (enabled && isValidURL(url)) {
        await sleep(wait);
        window.location.href = url;
    }
}

function errorNotification(message, timeout = 10 * 1000) {
    zennify.notify("Error", message, timeout, {
        type: `error`,
        buttons: [
            copyButton(message),
        ],
    })
}
