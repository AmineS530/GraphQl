import templates from "./templates.js";
import { checkAuth } from "./api/auth.js";
import "./helpers/utils.js";
import { fetchData } from "./api/getdata.js";
import { req } from "./requests.js";

export async function loadPage(page, event) {
    if (event) {
        event.preventDefault();
    }
    const authToken = localStorage.getItem('auth.jwt');
    const Authenticated = checkAuth(authToken);
    const app = document.getElementById("app");

    if (page === "auth" && Authenticated) {
        loadPage("home", event);
        return;
    }

    if (page === "home" && !Authenticated) {
        localStorage.removeItem('auth.jwt');
        return;
    }
    switch (page) {
        case "home":
            fetchData(req, authToken)
                .then(data => {
                    console.log("Fetched data:", data);
                    let dataOut = "";
                    for (let key in data.data.user[0]) {
                        dataOut += `<p><strong>${key}:</strong> ${data[key]}</p>`;
                    } app.innerHTML = templates.profilePage + dataOut;
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });
            appendHeader();
            break;
        case "auth":
            if (app.innerHTML !== templates.loginPage) {
                app.innerHTML = templates.loginPage;
            }
            break;
        default:
            break;
    }
};


function check() {
    const token = localStorage.getItem("auth.jwt");
    if (!checkAuth(token)) {
        loadPage("auth");
    } else {
        loadPage("home");
    }
}

window.logout = function logout(event) {
    event.preventDefault();

    document.getElementById("app").innerHTML = "";
    localStorage.removeItem("auth.jwt");
    document.getElementById("header").innerHTML = "";
    check();
};

window.showCredits = function showCredits() {
    const creditsContainer = document.createElement("div");
    creditsContainer.className = "credits-container";
    creditsContainer.innerHTML = templates.creditsPage;

    document.body.appendChild(creditsContainer);

    creditsContainer.addEventListener("click", function () {
        document.body.removeChild(creditsContainer);
    });
};

function appendHeader() {
    const header = document.getElementById("header")
    if (header.querySelector(".header")) return;
    header.innerHTML = templates.header;
}

check();