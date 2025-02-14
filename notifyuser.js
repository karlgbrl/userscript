async function notifyUser(title, message, timeout = 5000, redirectURL = null, copyText = null, customColor) {
        return new Promise(resolve => {
            if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
                const link = document.createElement('link');
                link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap';
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }

            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                left: 20px;
                max-width: 400px;
                background-color: ${customColor ? customColor : "#0C0C0C"};
                border: 1px solid #1c1c1c;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
                z-index: 9999999999 !important;
                opacity: 0.9;
                font-family: 'Open Sans', sans-serif;
                display: flex;
                overflow-wrap: break-line;
                overflow-x: hidden;
                color: #fff;
                flex-direction: column;
                align-items: flex-start;
                box-sizing: border-box;
            `;

            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.cssText = `margin-top: 0; color: #fff; font-weight: bold;`;
            notification.appendChild(titleElement);

            const messageElement = document.createElement('p');
            messageElement.style.cssText = `color: #fff;`;
            messageElement.textContent = message;
            notification.appendChild(messageElement);

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 5px;
                margin-top: 10px;
            `;

            if (copyText) {
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy';
                copyButton.style.cssText = `
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    background-color: #F2613F;
                    color: white;
                    cursor: pointer;
                    font-family: 'Open Sans', sans-serif;
                    transition: background-color 0.3s ease;
                    width: 100%;
                    box-sizing: border-box;
                `;
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(copyText)
                        .then(() => {
                            copyButton.textContent = "Copied!";
                            setTimeout(() => copyButton.textContent = "Copy", 2000);
                        })
                        .catch(err => console.error('Failed to copy: ', err));
                });
                copyButton.addEventListener('mouseover', () => {
                    copyButton.style.backgroundColor = '#C95438';
                });
                copyButton.addEventListener('mouseout', () => {
                    copyButton.style.backgroundColor = '#F2613F';
                });
                notification.appendChild(copyButton);
            }

            if (redirectURL) {
                const redirectButton = document.createElement('button');
                redirectButton.textContent = 'Go to Link';
                redirectButton.style.cssText = `
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    background-color: #006A67;
                    color: white;
                    cursor: pointer;
                    font-family: 'Open Sans', sans-serif;
                    transition: background-color 0.3s ease;
                    width: 100%;
                    box-sizing: border-box;
                `;
                redirectButton.addEventListener('click', () => {
                    notification.remove();
                    resolve();
                    window.location.href = redirectURL;
                });
                redirectButton.addEventListener('mouseover', () => {
                    redirectButton.style.backgroundColor = '#19827f';
                });
                redirectButton.addEventListener('mouseout', () => {
                    redirectButton.style.backgroundColor = '#006A67';
                });
                buttonContainer.appendChild(redirectButton);
                notification.appendChild(buttonContainer);
            }

            const mediaQuery = window.matchMedia('(min-width: 769px)');
            function handleMediaQueryChange(e) {
                if (e.matches) {
                    notification.style.left = 'auto';
                    notification.style.right = '20px';
                    notification.style.maxWidth = '400px';
                } else {
                    notification.style.left = '20px';
                    notification.style.right = '20px';
                    notification.style.maxWidth = 'calc(100% - 40px)';
                }
            }
            mediaQuery.addListener(handleMediaQueryChange);
            handleMediaQueryChange(mediaQuery);
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
                resolve();
            }, timeout);
        });
    }
