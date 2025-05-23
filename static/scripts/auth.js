import "./utils.js";
import { showNotification } from "./utils.js";
window.login = async function login(event) {
    event.preventDefault();

    const emailOrUsername = document.querySelector("input[name='usernameOrEmail']").value.trim();
    const password = document.querySelector("input[name='password']").value;

    // Validate inputs if needed
    await handleLogin(emailOrUsername, password);
}

export async function handleLogin(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
        showNotification("Please enter both email/username and password.", "error");
        return;
    }
    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${btoa(`${emailOrUsername}:${password}`)}`,
            },
        });

        if (!response.ok) {
            throw new Error('Invalid login credentials.');
        }

        const token = await response.text();
        if (!token) {
            throw new Error('No token received.');
        }

        localStorage.setItem('auth.jwt', token);
        window.location.reload();
    } catch (error) {
        showNotification(error.message || "An error occurred during login.", "error");
    }
}

// verify jwt token

window.checkAuth = async function checkAuth() {
    const authToken = localStorage.getItem('auth.jwt');
    if (!authToken) {
        return false;
    }

    try {
        try {
            const exp = JSON.parse(atob(authToken.split('.')[1])).exp;
            console.log("Token expiration time:", exp);
            return Date.now() / 1000 > exp;
        } catch {
            return true;
        }

    } catch (error) {
        console.error("Token verification failed:", error);
        return false;
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
            icon.style.color = "#fff";
        } else {
            input.type = "password";
            icon.innerText = "visibility";
            icon.style.color = "#565451";
        }
    }
});