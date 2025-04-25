const _setInterval = window.setInterval.bind(window);
const _clearInterval = window.clearInterval.bind(window);
const _setTimeout = window.setTimeout.bind(window);
const _clearTimeout = window.clearTimeout.bind(window);

Object.defineProperty(window, 'setInterval', {
    value: _setInterval,
    writable: false,
    configurable: false
});

class ZenNotification {
    constructor() {
        this.notifications = [];
        this.containerMap = new Map();
        this.addGlobalStyles(); // Keep global styles for basic structure
    }

    addGlobalStyles() {
        if (!document.querySelector('.zen-notification-styles-injected')) {
            const style = document.createElement('style');
            style.textContent = `
            .zen-notification-container {
                position: fixed !important;
                z-index: 9999999999 !important;
                pointer-events: none !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                width: auto !important;
            }
            .zen-notification-container.top-left { top: 20px !important; left: 20px !important; align-items: flex-start !important; }
            .zen-notification-container.top-right { top: 20px !important; right: 20px !important; align-items: flex-end !important; }
            .zen-notification-container.bottom-left { bottom: 20px !important; left: 20px !important; align-items: flex-start !important; }
            .zen-notification-container.bottom-right { bottom: 20px !important; right: 20px !important; align-items: flex-end !important; }
            .zen-notification-container.top-center { top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; align-items: center !important; }
            .zen-notification-container.bottom-center { bottom: 20px !important; left: 50% !important; transform: translateX(-50%) !important; align-items: center !important; }
            .zen-notification-container.center { top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; align-items: center !important; }
            .zen-notification {
                background: rgba(31, 31, 31, 0.65) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                opacity: 0.95 !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                padding: 16px !important;
                border-radius: 12px !important;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3) !important;
                font-family: 'Roboto', sans-serif !important;
                color: #fff !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                width: 380px !important;
                max-width: 90vw !important;
                word-break: break-word !important;
                overflow-wrap: break-word !important;
                pointer-events: auto !important;
                transform: translateY(20px) !important;
                opacity: 0 !important;
                transition: transform 0.3s ease, opacity 0.3s ease !important;
            }
            .zen-notification.show { transform: translateY(0) !important; opacity: 1 !important; }
            .zen-notification-title {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                font-size: 1.05rem !important;
                font-weight: 600 !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                padding-bottom: 8px !important;
            }
            .zen-notification-message {
                font-size: 0.95rem !important;
                line-height: 1.5 !important;
                opacity: 0.85 !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                white-space: normal !important;
                text-align: left !important;
                max-height: 4.2em !important;
                overflow: hidden !important;
                position: relative !important;
                transition: max-height 0.3s ease !important;
            }
            .zen-notification-message.expanded { max-height: 1000px !important; }
            .zen-notification-buttons { display: flex !important; gap: 8px !important; flex-wrap: wrap !important; }
            .zen-notification-button {
                flex: 1 !important;
                padding: 8px 12px !important;
                border-radius: 6px !important;
                border: none !important;
                background: #444 !important;
                color: #fff !important;
                font-size: 0.9rem !important;
                cursor: pointer !important;
                transition: background 0.2s ease !important;
            }
            .zen-notification-button:hover { background: #555 !important; }
            .zen-progress-bar { height: 4px !important; width: 100% !important; background: rgba(255, 255, 255, 0.1) !important; overflow: hidden !important; border-radius: 2px !important; position: relative !important; }
            .zen-progress-bar-fill { height: 100% !important; width: 0% !important; background: #3fe879 !important; position: absolute !important; left: 0 !important; top: 0 !important; will-change: width !important; }
            .zen-expand-button { background: none !important; color: #3fe879 !important; font-size: 0.85rem !important; padding: 0 !important; border: none !important; cursor: pointer !important; margin-left: 8px !important; opacity: 0 !important; transition: opacity 0.2s ease !important; }
            .zen-expand-wrapper { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important; }
            .zen-expand-wrapper:hover .zen-expand-button { opacity: 1 !important; }
            .zen-notification-countdown { font-size: 0.75rem !important; }
            .zen-notification.redirect {  border-color: #ed4e59 !important; box-shadow: 0 0 20px rgba(237, 78, 89, 0.4) !important; }
            .zen-notification.key {  border-color: #3fe879 !important; box-shadow: 0 0 20px rgba(63, 232, 121, 0.4) !important; }
            .zen-notification.error { border-color: #d82b2b !important; box-shadow: 0 0 20px rgba(216, 43, 43, 0.4) !important; }
            .zen-notification.status { border-color: #e87c3f !important; box-shadow: 0 0 20px rgba(232, 124, 63, 0.4) !important; }
            .zen-notification.default { border-color: #4154b0 !important; box-shadow: 0 0 20px rgba(65, 84, 176, 0.4) !important; }
            @media (max-width: 768px) {
                .zen-notification { width: 90vw !important; font-size: 0.85rem !important; padding: 12px !important; }
                .zen-notification-title { font-size: 0.95rem !important; }
                .zen-notification-message { font-size: 0.85rem !important; }
                .zen-notification-button { font-size: 0.85rem !important; padding: 6px 10px !important; }
            }
            @media (max-width: 480px) {
                .zen-notification { font-size: 0.8rem !important; }
                .zen-notification-title { font-size: 0.9rem !important; }
                .zen-notification-message { font-size: 0.8rem !important; }
                .zen-notification-button { font-size: 0.8rem !important; padding: 5px 8px !important; }
            }
            `;
            style.classList.add('zen-notification-styles-injected');
            document.head.appendChild(style);
        }
    }

    setPosition(position = 'top-right') {
        if (!this.containerMap.has(position)) {
            const container = document.createElement('div');
            container.classList.add('zen-notification-container', position);
            document.body.appendChild(container);
            this.containerMap.set(position, container);
        }
        this.container = this.containerMap.get(position);
    }

    renderMessage(html) {
        const div = document.createElement('div');
        div.classList.add('zen-notification-message');
        div.innerHTML = html;
        return div;
    }

    addExpandButton(messageElement) {
        requestAnimationFrame(() => {
            const lineHeight = parseFloat(getComputedStyle(messageElement).lineHeight) || 20;
            const lines = Math.round(messageElement.scrollHeight / lineHeight);
            if (lines > 3) {
                const wrapper = document.createElement('div');
                wrapper.className = 'zen-expand-wrapper';

                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'zen-expand-button';
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
        const { type = 'default', buttons = [], countdown = false, countdownText = `Dismissing in {time}s`, position = 'top-right', showProgress = false,
            style = {}
        } = options;
        this.setPosition(position);
        let autoTimeoutId;
        let resolvePromise;
        const onClosePromise = new Promise(resolve => {
            resolvePromise = resolve;
        });
        const notification = document.createElement('div');
        notification.classList.add('zen-notification', type);
		
        Object.assign(notification.style, style.container);

        const titleElement = document.createElement('div');
        titleElement.classList.add('zen-notification-title');
        titleElement.innerHTML = `<i class="fas ${this.getIconClass(type)}"></i> ${title}`;
		
        Object.assign(titleElement.style, style.title);
        notification.appendChild(titleElement);

        const messageElement = document.createElement('div');
        messageElement.classList.add('zen-notification-message');
        messageElement.textContent = message;
		
        Object.assign(messageElement.style, style.message);
        notification.appendChild(messageElement);

        const expandBtn = this.addExpandButton(messageElement);
        if (expandBtn) notification.appendChild(expandBtn);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('zen-notification-buttons');
		
        Object.assign(buttonContainer.style, style.buttonsContainer);
        this.createButtons(buttonContainer, buttons.slice(0, 2), notification, style.button, () => resolvePromise()); // Pass button styles
        if (buttons.length) notification.appendChild(buttonContainer);

        if (showProgress && timeout !== null) {
            const progressBar = document.createElement('div');
            progressBar.classList.add('zen-notification-bar');
			
            Object.assign(progressBar.style, style.progressBar);
            const fill = document.createElement('div');
            fill.classList.add('zen-notification-bar-fill');
            fill.style.transition = `width ${timeout}ms linear`;
			
            Object.assign(fill.style, style.progressBarFill);
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
            countdownElement.classList.add('zen-notification-countdown');
			
            Object.assign(countdownElement.style, style.countdown);
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
            btn.classList.add('zen-notification-button', ...(button.className ? button.className.split(' ') : []));
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
        notificationElement.classList.remove('show');
        _setTimeout(() => {
            notificationElement.remove();
            this.notifications = this.notifications.filter(n => n.element !== notificationElement);
            if (resolve) resolve();
        }, 300);
    }
}

const zenNotify = new ZenNotification();
