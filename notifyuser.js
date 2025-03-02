function addStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    style.classList.add('customcodenotify-styles-injected');
    document.head.appendChild(style);
}

const myCSS = `
    .customcodenotify {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 85% !important;
        max-width: 400px !important;
        background-color: #0f0f0f !important;
        opacity: 0.9 !important;
        border: 1.5px solid !important;
        padding: 15px !important;
        border-radius: 5px !important;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2) !important;
        z-index: 9999999999 !important;
        font-family: 'Roboto', sans-serif !important;
        color: #fff !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        box-sizing: border-box !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        transition: top 0.3s ease !important;
    }

    .customcodenotify-title {
        margin-top: 0 !important;
        font-weight: bold !important;
        font-size: 1.1em !important;
        font-family: 'Roboto', sans-serif !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        white-space: nowrap !important;
    }

    .customcodenotify-message {
        margin-bottom: 5px !important;
        font-size: 0.9em !important;
        font-family: 'Roboto', sans-serif !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        width: 100% !important;
    }

    .customcodenotify-buttons {
        display: flex !important;
        gap: 5px !important;
        width: 100% !important;
    }

    .customcodenotify-button {
        padding: 8px 16px !important;
        border: none !important;
        border-radius: 5px !important;
        color: white !important;
        cursor: pointer !important;
        font-family: 'Roboto', sans-serif !important;
        transition: background-color 0.3s ease !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }

    .copy-button { background-color: #61c779 !important; }
    .copy-button:hover { background-color: #38C95A !important; }

    .redirect-button { background-color: #cc7835 !important; }
    .redirect-button:hover { background-color: #805634 !important; }

    .customcodenotify-countdown {
        margin-top: 5px !important;
        font-size: smaller !important;
        opacity: 0.7 !important;
    }

    /* Media Queries for Responsiveness */
    @media (max-width: 768px) {
        .customcodenotify {
            width: 70% !important;
            right: 5% !important;
            left: 5% !important;
            top: 10px !important;
            max-width: none !important;
        }

        .customcodenotify-title {
            font-size: 1em !important;
        }

        .customcodenotify-message {
            font-size: 0.8em !important;
        }

        .customcodenotify-button {
            padding: 6px 12px !important;
            font-size: 0.8em !important;
        }
    }

    @media (max-width: 480px) {
        .customcodenotify {
            width: 75% !important;
            right: 2.5% !important;
            left: 2.5% !important;
            top: 5px !important;
        }

        .customcodenotify-title {
            font-size: 0.9em !important;
        }

        .customcodenotify-message {
            font-size: 0.75em !important;
        }

        .customcodenotify-button {
            padding: 5px 10px !important;
            font-size: 0.75em !important;
        }
    }
`;

if (!document.querySelector('.customcodenotify-styles-injected')) {
    addStyles(myCSS);
}

const notificationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.removedNodes.length) {
            mutation.removedNodes.forEach(node => {
                if (node.classList && node.classList.contains('customcodenotify')) {
                    recalculateNotificationPositions();
                }
            });
        }
    });
});

notificationObserver.observe(document.body, { childList: true });

async function notifyUser(title, message, timeout = 5000, options = {}) {
    const { type = 'default', copyText = null, redirectURL = null, countdown = false, countdownText = `Redirecting in {time}s` } = options;

    return new Promise(resolve => {
        if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        if (!document.querySelector('link[href*="fontawesome.com"]')) {
            const faLink = document.createElement('link');
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
            faLink.rel = 'stylesheet';
            document.head.appendChild(faLink);
        }

        const notification = document.createElement('div');
        notification.classList.add('customcodenotify');

        let borderColor = '#4154b0';
        let iconClass = 'fa-info-circle'; // Default icon
        switch (type) {
            case 'redirect':
                borderColor = '#3f55e8';
                iconClass = 'fa-external-link-alt';
                break;
            case 'key':
                borderColor = '#3fe879';
                iconClass = 'fa-copy';
                break;
            case 'error':
                borderColor = '#d82b2b';
                iconClass = 'fa-exclamation-circle';
                break;
            case 'status':
                borderColor = '#e87c3f';
                iconClass = 'fa-check-circle';
                break;
        }
        notification.style.borderColor = borderColor;

        notification.innerHTML = `
            <h3 class="customcodenotify-title">
                <i class="fas ${iconClass}" style="color: ${borderColor};"></i>
                ${title}
            </h3>
            <p class="customcodenotify-message">${message}</p>
            <div class="customcodenotify-buttons"></div>
            ${countdown ? '<div class="customcodenotify-countdown"></div>' : ''}
        `;

        const buttonContainer = notification.querySelector('.customcodenotify-buttons');
        const countdownElement = notification.querySelector('.customcodenotify-countdown');

        if (copyText) {
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('customcodenotify-button', 'copy-button');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(copyText)
                    .then(() => {
                        copyButton.textContent = "Copied!";
                        setTimeout(() => copyButton.textContent = "Copy", 2000);
                    })
                    .catch(err => console.error('Failed to copy: ', err));
            });
            buttonContainer.appendChild(copyButton);
        }

        if (redirectURL) {
            const redirectButton = document.createElement('button');
            redirectButton.textContent = 'Go to Link';
            redirectButton.classList.add('customcodenotify-button', 'redirect-button');
            redirectButton.addEventListener('click', () => {
                window.location.href = redirectURL;
            });
            buttonContainer.appendChild(redirectButton);
        }

        if (countdown && countdownElement) {
            let remainingTime = timeout / 1000;
            countdownElement.textContent = countdownText.replace(`{time}`, remainingTime);
            const countdownInterval = setInterval(() => {
                remainingTime--;
                countdownElement.textContent = countdownText.replace(`{time}`, remainingTime);
                if (remainingTime < 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }

        document.body.appendChild(notification);
        recalculateNotificationPositions();

        setTimeout(() => {
            notification.remove();
            resolve();
            recalculateNotificationPositions();
        }, timeout);
    });
}

function recalculateNotificationPositions() {
    const notifications = document.querySelectorAll('.customcodenotify');
    let topPosition = 20;

    notifications.forEach(notification => {
        notification.style.top = `${topPosition}px`;
        topPosition += notification.offsetHeight + 20; // Add 20px spacing between notifications
    });
}
