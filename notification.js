class ZenNotification {
    constructor() {
        this.styleInjected = false;
        this.notifications = [];
        this.addGlobalStyles();
    }

    addGlobalStyles() {
        if (!this.styleInjected) {
            const style = document.createElement('style');
            style.textContent = `
                .zen-notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    z-index: 9999999999;
                    pointer-events: none;
                    width: 50%;
                    max-width: 80%;
                }

                .zen-notification {
                    background: #0f0f0f !important;
                    opacity: 0.9;
                    border: 1.5px solid;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
                    font-family: 'Roboto', sans-serif;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    box-sizing: border-box;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    margin-top: 10px;
                    transition: all 0.3s ease-in-out;
                    transform: translateX(110%);
                    pointer-events: auto;
                    width: 100%;
                    max-width: 400px;
                }

                .zen-notification.show {
                    transform: translateX(0);
                }

                .zen-notification-title {
                    color: #f0f0f0 !important;
                    text-align: left !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    font-weight: bold !important;
                    font-size: 1.1em !important;
                    font-family: 'Roboto', sans-serif !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    white-space: nowrap !important;
                }

                .zen-notification-message {
                    color: #f0f0f0 !important;
                    text-align: left !important;
                    margin: 5px 0 0 0 !important;
                    padding: 0 !important;
                    font-size: 0.9em !important;
                    font-family: 'Roboto', sans-serif !important;
                    white-space: normal !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    width: 100% !important;
                    display: -webkit-box !important;
                    -webkit-line-clamp: 1 !important;
                    -webkit-box-orient: vertical !important;
                }

                .zen-notification-buttons {
                    display: flex;
                    gap: 5px;
                    width: 100%;
                    margin-top: 10px;
                }

                .zen-notification-button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    color: white;
                    cursor: pointer;
                    font-family: 'Roboto', sans-serif;
                    transition: background-color 0.3s ease;
                    width: 100%;
                    box-sizing: border-box;
                    font-size: 0.9em;
                }

                .zen-notification-button:hover {
                    filter: brightness(1.1);
                }

                .zen-notification-countdown {
                    margin-top: 5px;
                    font-size: smaller;
                    opacity: 0.7;
                }

                .zen-notification.redirect { border-color: #ed4e59; }
                .zen-notification.key { border-color: #3fe879; }
                .zen-notification.error { border-color: #d82b2b; }
                .zen-notification.status { border-color: #e87c3f; }
                .zen-notification.default { border-color: #4154b0; }

                .copy-button { background-color: #61c779; }
                .copy-button:hover { background-color: #38C95A; }

                .redirect-button { background-color: #cc7835; }
                .redirect-button:hover { background-color: #805634; }

                .close-button { background-color:rgb(230, 61, 61)}
                .close-button:hover { background-color:rgb(115, 30, 30)}

                .zen-notification.redirect .zen-notification-title i { color: #ed4e59; }
                .zen-notification.key .zen-notification-title i { color: #3fe879; }
                .zen-notification.error .zen-notification-title i { color: #d82b2b; }
                .zen-notification.status .zen-notification-title i { color: #e87c3f; }
                .zen-notification.default .zen-notification-title i { color: #4154b0; }

                @media (max-width: 768px) {
                    .zen-notification-container {
                        width: 95%;
                        right: auto;
                        left: 2.5%;
                        align-items: center;
                    }
                    .zen-notification {
                        width: 100%;
                        max-width: none;
                    }
                    .zen-notification-title {
                        font-size: 1em;
                    }
                    .zen-notification-message {
                        font-size: 0.85em;
                    }
                    .zen-notification-button {
                        font-size: 0.85em;
                        padding: 6px 12px;
                    }
                }

                @media (max-width: 480px) {
                    .zen-notification-title {
                        font-size: 0.9em;
                    }
                    .zen-notification-message {
                        font-size: 0.8em;
                    }
                    .zen-notification-button {
                        font-size: 0.8em;
                        padding: 5px 10px;
                    }
                }
            `;
            style.classList.add('zen-notification-styles-injected');
            document.head.appendChild(style);
            this.styleInjected = true;

            this.container = document.createElement('div');
            this.container.classList.add('zen-notification-container');
            document.body.appendChild(this.container);
        }
    }

    notify(title, message, timeout = 5000, options = {}) {
        this.ensureDependencies();
        const { type = 'default', buttons = [], countdown = false, countdownText = `Dismissing in {time}s` } = options;
        let autoTimeoutId;
        let resolvePromise;

        const notification = document.createElement('div');
        notification.classList.add('zen-notification', type);

        const titleElement = document.createElement('h3');
        titleElement.classList.add('zen-notification-title');
        titleElement.innerHTML = `<i class="fas ${this.getIconClass(type)}"></i> ${title}`;
        notification.appendChild(titleElement);

        const messageElement = document.createElement('p');
        messageElement.classList.add('zen-notification-message');
        messageElement.textContent = message;
        notification.appendChild(messageElement);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('zen-notification-buttons');
        this.createButtons(buttonContainer, buttons, notification, () => resolvePromise());
        notification.appendChild(buttonContainer);

        let countdownElement;
        if (countdown) {
            countdownElement = document.createElement('div');
            countdownElement.classList.add('zen-notification-countdown');
            notification.appendChild(countdownElement);
            this.startCountdown(countdownElement, timeout, countdownText, notification, () => resolvePromise());
        } else {
            autoTimeoutId = setTimeout(() => {
                this.removeNotification(notification, () => resolvePromise());
            }, timeout);
        }

        this.container.appendChild(notification);
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        this.notifications.push({ element: notification, timeoutId: countdown ? null : autoTimeoutId });

        const onClosePromise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        const returnObject = {
            element: notification,
            close: () => {
                clearTimeout(autoTimeoutId);
                this.removeNotification(notification, () => resolvePromise());
            },
            onClose: async () => {
                await onClosePromise;
            }
        };
        console.log("Notify function executed, onClose is:", typeof returnObject.onClose);
        return returnObject;
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
            if (button.onClick) {
                btn.addEventListener('click', () => {
                    button.onClick(this, btn, notificationElement);
                });
            } else if (button.closeOnClick !== false) {
                btn.addEventListener('click', () => this.removeNotification(notificationElement, resolve));
            }
            container.appendChild(btn);
        });
    }

    startCountdown(element, timeout, text, notification, resolve) {
        let remainingTime = Math.ceil(timeout / 1000);
        element.textContent = text.replace(`{time}`, remainingTime);
        const interval = setInterval(() => {
            remainingTime--;
            element.textContent = text.replace(`{time}`, remainingTime);
            if (remainingTime < 0) {
                clearInterval(interval);
                this.removeNotification(notification, resolve);
            }
        }, 1000);
        const notificationData = this.notifications.find(n => n.element === notification);
        if (notificationData) {
            notificationData.timeoutId = interval;
        }
    }

    removeNotification(notificationElement, resolve) {
        notificationElement.classList.remove('show');
        const notificationData = this.notifications.find(n => n.element === notificationElement);
        if (notificationData && notificationData.timeoutId) {
            clearInterval(notificationData.timeoutId);
        }
        setTimeout(() => {
            notificationElement.remove();
            this.notifications = this.notifications.filter(n => n.element !== notificationElement);
            this.recalculatePositions();
            if (resolve) {
                resolve();
            }
        }, 300);
    }

    recalculatePositions() {
        const notifications = this.container.querySelectorAll('.zen-notification');
        let topPosition = 20;
        notifications.forEach(notification => {
            notification.style.top = `${topPosition}px`;
            topPosition += notification.offsetHeight + 10;
        });
    }
}

const zenNotify = new ZenNotification();
