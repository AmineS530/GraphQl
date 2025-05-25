import "../helpers/utils.js";
import { APIS } from "../helpers/vars.js";
import { showNotification } from "../helpers/utils.js";
import { loadPage } from "../main.js";

/* Login */
window.login = async function login(event) {
    event.preventDefault();

    const emailOrUsername = document.querySelector("input[name='usernameOrEmail']").value.trim();
    const password = document.querySelector("input[name='password']").value;

    await handleLogin(emailOrUsername, password);
    loadPage("home", event);
};

export async function handleLogin(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
        showNotification("Please enter both email/username and password.", "error");
        return;
    }
    try {
        const response = await fetch(APIS.SIGNIN, {
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

        localStorage.setItem('auth.jwt', token.slice(1, -1));
    } catch (error) {
        showNotification(error.message || "An error occurred during login.", "error");
    }
}


function isValidJWT(token) {
    if (!token) return false;

    try {
        const [headerBase64, payloadBase64] = token.split(".");

        /*Check Header*/
        const headerJson = atob(headerBase64);
        const header = JSON.parse(headerJson);
        if (header.typ !== "JWT" || header.alg !== "HS256") {
            return false;
        }

        /*Check Payload*/
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        // Check expiration
        if (!payload.exp || payload.exp * 1000 <= Date.now()) {
            return false;
        }
        // Check structure
        if (!payload.sub || !payload.ip || !payload["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]) {
            return false;
        }
        return true;
    } catch (err) {
        localStorage.removeItem('auth.jwt');
        return false;
    }
}

export function checkAuth(authToken) {
    if (authToken) {
        if (isValidJWT(authToken)) {
            return true;
        } else {
            localStorage.removeItem('auth.jwt');
            return false;
        }
    }
    return false;
}

