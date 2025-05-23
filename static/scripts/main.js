import templates from "./templates.js";
import "./auth.js";
import "./utils.js";
import { fetchData } from "./request.js";
import req from "./request.js";

window.loadPage = async function (page, event) {
    if (event) {
        event.preventDefault();
    }
    //todo: verify/check expirym force logout (delete token on failure)
    // set interval to how frequent to check the token
    // const check = localStorage.getItem('auth.jwt');
    // console.log(check);

    switch (page) {
        case "home":
            document.body.innerHTML = templates.background + templates.profilePage;
            console.log(req);
            await fetchData(req);
            appendHeader();
            break;
        case "auth":
            document.body.innerHTML = templates.background + templates.loginPage; //+ templates.footer;
            break;
        default:
            break;
    }
    appendFooter();
};

check();

function appendHeader() {
    const header = document.createElement("header");
    header.innerHTML = templates.header;
    document.body.insertBefore(header, document.body.firstChild);
}

function appendFooter() {
    const footer = document.createElement("footer");
    footer.innerHTML = templates.footer;
    document.body.appendChild(footer);
}

function check() {
    if (!localStorage.getItem("auth.jwt")) {
        loadPage("auth");
    } else {
        loadPage("home");
        checkAuth();
    }
}

window.logout = function logout(event) {
    event.preventDefault();

    localStorage.removeItem("auth.jwt");
    window.loadPage("auth");
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
