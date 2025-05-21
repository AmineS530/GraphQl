import  templates  from "./templates.js";
import { login } from "./auth.js";



if (!localStorage.getItem('auth.jwt')) {
   document.body.innerHTML = templates.loginPage;
} else {
    // todo: redirect to dashboard
    // window.location.href = 
}



document.getElementById('loginBtn').addEventListener('click', async () => {
    const emailOrUsername = document.querySelector("input[name='usernameOrEmail']").value;
    const password = document.querySelector("input[name='password']").value;
    login(emailOrUsername, password);
    // Validate inputs
    await login(emailOrUsername, password);
});

