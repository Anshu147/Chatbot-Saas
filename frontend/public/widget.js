(function() {
    // Configuration
    const script = document.currentScript;
    const chatbotId = script.getAttribute('data-chatbot-id');
    const primaryColor = script.getAttribute('data-primary-color') || '#3B82F6';
    const position = script.getAttribute('data-position') || 'bottom-right';
    
    // Get host URL from script src
    const scriptUrl = new URL(script.src);
    const hostUrl = scriptUrl.origin;

    // Create Widget Container
    const container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.bottom = '20px';
    
    if (position === 'bottom-right') {
        container.style.right = '20px';
    } else {
        container.style.left = '20px';
    }
    
    // Create Button
    const button = document.createElement('div');
    button.id = 'chatbot-widget-button';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '30px';
    button.style.backgroundColor = primaryColor;
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `;

    // Create Iframe Window
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'chatbot-widget-window';
    iframeContainer.style.position = 'absolute';
    iframeContainer.style.bottom = '80px';
    iframeContainer.style.width = '400px';
    iframeContainer.style.height = '600px';
    iframeContainer.style.maxHeight = 'calc(100vh - 120px)';
    iframeContainer.style.maxWidth = 'calc(100vw - 40px)';
    iframeContainer.style.backgroundColor = 'white';
    iframeContainer.style.borderRadius = '16px';
    iframeContainer.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
    iframeContainer.style.overflow = 'hidden';
    iframeContainer.style.display = 'none';
    iframeContainer.style.opacity = '0';
    iframeContainer.style.transform = 'translateY(20px)';
    iframeContainer.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    if (position === 'bottom-right') {
        iframeContainer.style.right = '0';
    } else {
        iframeContainer.style.left = '0';
    }

    const iframe = document.createElement('iframe');
    iframe.src = `${hostUrl}/widget/${chatbotId}?primaryColor=${encodeURIComponent(primaryColor)}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    iframeContainer.appendChild(iframe);
    container.appendChild(iframeContainer);
    container.appendChild(button);
    document.body.appendChild(container);

    // Toggle Chat
    let isOpen = false;
    button.onclick = function() {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.style.display = 'block';
            setTimeout(() => {
                iframeContainer.style.opacity = '1';
                iframeContainer.style.transform = 'translateY(0)';
            }, 10);
            button.style.transform = 'scale(0.9)';
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
        } else {
            iframeContainer.style.opacity = '0';
            iframeContainer.style.transform = 'translateY(20px)';
            setTimeout(() => {
                iframeContainer.style.display = 'none';
            }, 300);
            button.style.transform = 'scale(1)';
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            `;
        }
    };

    // Mobile adjustments
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 480px) {
            #chatbot-widget-window {
                width: calc(100vw - 40px) !important;
                height: calc(100vh - 120px) !important;
                bottom: 80px !important;
            }
        }
    `;
    document.head.appendChild(style);
})();
