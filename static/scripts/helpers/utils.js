let notificationCooldown = false;

const sounds = {
    alert: new Audio("static/sounds/alert.mp3"),
    notification: new Audio("static/sounds/notification.mp3")
};

function playSound(name) {
    const sound = sounds[name];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Playback failed:", e));
    }
}

export function showNotification(message, type = "success", sound = true, duration = 3000) {
    if (notificationCooldown) return;

    notificationCooldown = true;

    // Create toast container
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;

    // Get appropriate icon and title based on type
    const toastConfig = {
        success: {
            title: "Success!",
            icon: `<svg class="toast__svg" viewBox="0 0 24 24">
                     <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                   </svg>`
        },
        error: {
            title: "Error!",
            icon: `<svg class="toast__svg" viewBox="0 0 24 24">
                     <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                   </svg>`
        }
    };

    const config = toastConfig[type] || toastConfig.info;

    // Create toast HTML structure
    toast.innerHTML = `
        <div class="toast__icon">
            ${config.icon}
        </div>
        <div class="toast__content">
            <p class="toast__type">${config.title}</p>
            <p class="toast__message">${message}</p>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(toast);

    // Show toast with animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Play sound
    if (sound) {
        if (type === "success") {
            playSound("notification");
        } else {
            playSound("alert");
        }
    }

    // Auto-hide after duration
    const hideTimeout = setTimeout(() => {
        hideToast(toast);
    }, duration);

    // Store timeout reference to clear if manually closed
    toast._hideTimeout = hideTimeout;

    function hideToast(toastElement) {
        // Clear timeout if it exists
        if (toastElement._hideTimeout) {
            clearTimeout(toastElement._hideTimeout);
        }

        // Remove show class to trigger exit animation
        toastElement.classList.remove('show');
        toastElement.style.top = '-200px';

        // Remove element after animation completes
        toastElement.addEventListener('transitionend', () => {
            if (toastElement.parentNode) {
                toastElement.remove();
            }
        }, { once: true });

        // Reset cooldown after animation
        setTimeout(() => {
            notificationCooldown = false;
        }, 500);
    }
}

document.addEventListener("click", function (event) {
    const btn = event.target.closest(".togglePwd");
    if (!btn) return;

    const input = btn.previousElementSibling;
    const icon = btn.querySelector(".icon");

    if (input && icon) {
        if (input.type === "password") {
            input.type = "text";
            icon.innerText = "visibility_off";
        } else {
            input.type = "password";
            icon.innerText = "visibility";
        }
    }
});
