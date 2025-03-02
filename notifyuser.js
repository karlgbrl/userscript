function addStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    style.classList.add('customcodenotify-styles-injected');
    document.head.appendChild(style);
}

const myCSS = `
    .customcodenotify {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 85%; /* Responsive width */
        max-width: 400px; /* Maximum width for larger screens */
        background-color: #0f0f0f;
        opacity: 0.9;
        border: 1.5px solid;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 9999999999;
        font-family: 'Roboto', sans-serif;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        word-wrap: break-word;
        overflow-wrap: break-word;
        transition: top 0.3s ease;
    }

    .customcodenotify-title {
        margin-top: 0 !important;
        font-weight: bold !important;
        font-size: 1.1em !important;
        font-family: 'Roboto', sans-serif !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        white-space: nowrap !important; /* Prevent wrapping */
    }

    .customcodenotify-message {
        margin-bottom: 5px !important;
        font-size: 0.9em !important;
        font-family: 'Roboto', sans-serif !important;
        white-space: nowrap !important; /* Prevent text from wrapping to the next line */
        overflow: hidden !important;    /* Hide any text that overflows the container */
        text-overflow: ellipsis !important; /* Display "..." for overflowed text */
        width: 100% !important; /* Full width for responsiveness */
    }

    .customcodenotify-buttons {
        display: flex;
        gap: 5px;
        width: 100%;
    }

    .customcodenotify-button {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        transition: background-color 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .copy-button { background-color: #61c779; }
    .copy-button:hover { background-color: #38C95A; }

    .redirect-button { background-color: #cc7835; }
    .redirect-button:hover { background-color: #805634; }

    .customcodenotify-countdown {
        margin-top: 5px;
        font-size: smaller;
        opacity: 0.7;
    }

    /* Media Queries for Responsiveness */
    @media (max-width: 768px) {
        .customcodenotify {
            width: 70%; /* Take up more width on smaller screens */
            right: 5%; /* Center the notification */
            left: 5%; /* Center the notification */
            top: 10px; /* Adjust top position */
            max-width: none; /* Remove max-width restriction */
        }

        .customcodenotify-title {
            font-size: 1em; /* Smaller font size for mobile */
        }

        .customcodenotify-message {
            font-size: 0.8em; /* Smaller font size for mobile */
            // white-space: normal; /* Allow text to wrap on smaller screens */
        }

        .customcodenotify-button {
            padding: 6px 12px; /* Smaller padding for mobile */
            font-size: 0.8em; /* Smaller font size for mobile */
        }
    }

    @media (max-width: 480px) {
        .customcodenotify {
            width: 75%; /* Take up almost full width on very small screens */
            right: 2.5%; /* Center the notification */
            left: 2.5%; /* Center the notification */
            top: 5px; /* Adjust top position */
        }

        .customcodenotify-title {
            font-size: 0.9em; /* Even smaller font size for very small screens */
        }

        .customcodenotify-message {
            font-size: 0.75em; /* Even smaller font size for very small screens */
        }

        .customcodenotify-button {
            padding: 5px 10px; /* Even smaller padding for very small screens */
            font-size: 0.75em; /* Even smaller font size for very small screens */
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
