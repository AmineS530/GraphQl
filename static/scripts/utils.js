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

export function showNotification(message, type = "success", sound = true) {
    if (notificationCooldown) return;

    notificationCooldown = true;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Slide down
    requestAnimationFrame(() => {
        notification.style.top = "40px";
    });

    // Play sound
    if (sound) {
        if (type === "success") {
            playSound("notification");
        } else {
            playSound("alert");
        }
    }

    setTimeout(() => {
        notification.style.top = "-100px";
        notification.style.opacity = "0";

        notification.addEventListener("transitionend", () => {
            notification.remove();
        }, { once: true });

        // Reset cooldown after animation finishes
        setTimeout(() => {
            notificationCooldown = false;
        }, 500);
    }, 1500);
}

window.logout = function logout(event) {
    event.preventDefault();

    localStorage.removeItem('auth.jwt');
    window.location.reload();
}
