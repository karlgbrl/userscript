function addStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    style.classList.add('notification-styles-injected'); // Add a class to mark it
    document.head.appendChild(style);
}

const myCSS = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        left: 20px; /* Default left position */
        max-width: 400px; /* Default max-width */
        background-color: #0C0C0C;
        border: 1px solid #1c1c1c;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 9999999999 !important;
        opacity: 0.9;
        font-family: 'Open Sans', sans-serif;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        /* Use word-wrap for older browsers, overflow-wrap for modern ones */
        word-wrap: break-word; /* Legacy browsers */
        overflow-x: hidden;
        overflow-wrap: break-word; /* Modern browsers */
    }

    .notification-title {
        margin-top: 0;
        font-weight: bold;
    }

    .notification-message {
        margin-bottom: 10px;
    }

    .notification-buttons {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 100%;
    }

    .notification-button {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
        transition: background-color 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .copy-button { background-color: #F2613F; }
    .copy-button:hover { background-color: #C95438; }

    .redirect-button { background-color: #006A67; }
    .redirect-button:hover { background-color: #19827f; }

    .notification-countdown {
        margin-top: 5px;
        font-size: smaller;
        opacity: 0.7;
    }

    /* Small screens (e.g., mobile) */
    @media (max-width: 575px) {
        .notification {
            font-size: 14px; /* Smaller font size */
            padding: 10px; /* Smaller padding */
            left: 10px;
            right: 10px;
            max-width: calc(100% - 20px);
        }

        .notification-title {
            font-size: 1.2em; /* Relative font size */
        }

        .notification-buttons {
            flex-direction: column; /* Buttons stack vertically */
        }
    }

    /* Medium screens (e.g., tablets) */
    @media (min-width: 576px) and (max-width: 768px) {
        .notification {
            font-size: 16px;
            padding: 12px;
        }
        .notification-buttons {
        flex-direction: column; /* Buttons stack vertically */
        }
    }

    /* Large screens (e.g., desktops) - your existing styles */
    @media (min-width: 769px) {
        .notification {
            left: auto;
            right: 20px;
            max-width: 400px;
            font-size: 16px; /* Or a larger size if you prefer */
            padding: 15px;
        }
        .notification-buttons {
            flex-direction: row; /* Buttons side by side */
            gap: 10px;
        }
        .notification-button {
        width: auto; /* reset the width to auto */
        }
    }
`;

// Inject CSS only once
if (!document.querySelector('.notification-styles-injected')) {
    addStyles(myCSS);
}

const notificationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.removedNodes.length) {
            mutation.removedNodes.forEach(node => {
                if (node.classList && node.classList.contains('notification')) {
                    recalculateNotificationPositions();
                }
            });
        }
    });
});

async function notifyUser(title, message, timeout = 5000, options = {}) {
    const { redirectURL = null, copyText = null, customColor = "#0C0C0C", countdown = false, countdownText = `Hang tight for {time} seconds.` } = options;

    return new Promise(resolve => {
        if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.style.backgroundColor = customColor; // Set custom color
        
        notification.innerHTML = `
            <h3 class="notification-title">${title}</h3>
            <p class="notification-message">${message}</p>
            <div class="notification-buttons"></div>
            ${countdown ? '<div class="notification-countdown"></div>' : ''}
        `;

        const existingNotifications = document.querySelectorAll('.notification');
        let topPosition = 20;

        if (existingNotifications.length > 0) {
            const lastNotification = existingNotifications[existingNotifications.length - 1];
            topPosition = lastNotification.offsetTop + lastNotification.offsetHeight + 20; // Add spacing (20px)
        }

        notification.style.top = `${topPosition}px`; // Set the top position

        const buttonContainer = notification.querySelector('.notification-buttons');
        const countdownElement = notification.querySelector('.notification-countdown');

        const createButton = (text, className, clickHandler, hoverHandler) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('notification-button', className);
            button.addEventListener('click', clickHandler);
            if (hoverHandler) {
                button.addEventListener('mouseover', () => hoverHandler(button, true));
                button.addEventListener('mouseout', () => hoverHandler(button, false));
            }
            return button;
        };

        if (copyText) {
            const copyButton = createButton('Copy', 'copy-button', () => {
                navigator.clipboard.writeText(copyText)
                    .then(() => {
                        copyButton.textContent = "Copied!";
                        setTimeout(() => copyButton.textContent = "Copy", 2000);
                    })
                    .catch(err => console.error('Failed to copy: ', err));
            }, (button, isHovering) => {
                button.style.backgroundColor = isHovering ? '#C95438' : '#F2613F';
            });
            buttonContainer.appendChild(copyButton);
        }

        if (redirectURL) {
            const redirectButton = createButton('Go to Link', 'redirect-button', () => {
                notification.remove();
                resolve();
                window.location.href = redirectURL;
            }, (button, isHovering) => {
                button.style.backgroundColor = isHovering ? '#19827f' : '#006A67';
            });
            buttonContainer.appendChild(redirectButton);
        }

        if (countdown && countdownElement) {
            let remainingTime = timeout / 1000;
            countdownElement.textContent = `(${remainingTime})`;
            const countdownInterval = setInterval(() => {
                remainingTime--;
                countdownElement.textContent = countdownText.replaceAll(`{time}`, remainingTime);
                if (remainingTime < 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
            resolve();
            setTimeout(recalculateNotificationPositions, 10);
        }, timeout);
    });
}

function recalculateNotificationPositions() {
    const existingNotifications = document.querySelectorAll('.notification');
    let topPosition = 20;

    existingNotifications.forEach(notif => {
        notif.style.top = `${topPosition}px`;
        topPosition += notif.offsetHeight + 20;
    });
}
