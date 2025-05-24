import "../helpers/utils.js";
import { APIS } from "../helpers/vars.js";
import { showNotification } from "../helpers/utils.js";


/* Login */
window.login = async function login(event) {
    event.preventDefault();

    const emailOrUsername = document.querySelector("input[name='usernameOrEmail']").value.trim();
    const password = document.querySelector("input[name='password']").value;

    await handleLogin(emailOrUsername, password);
}

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

        localStorage.setItem('auth.jwt', token);
        window.location.reload();
    } catch (error) {
        showNotification(error.message || "An error occurred during login.", "error");
    }
}

// verify User Token
function base64UrlToBase64(base64UrlString) {
  let base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '=' until length is a multiple of 4
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

function isValidJWT(token) {
    if (!token) return false;

    try {
        const [, payloadBase64] = token.split(".");
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        // Check expiration
        if (!payload.exp || payload.exp * 1000 <= Date.now()) {
            return false;
        }
        // Check structure
        if (!payload.sub || !payload["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]) {
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

