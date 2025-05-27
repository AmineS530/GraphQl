import templates from "./templates.js";
import { checkAuth } from "./api/auth.js";
import "./helpers/utils.js";
import { fetchData } from "./api/getdata.js";
import {  basicInfo } from "./requests.js";
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
            app.innerHTML = templates.profilePage;
            placeData();
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
}


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
    document.body.style.overflow = "hidden";
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
    document.body.style.overflow = "auto";
}

check();

const userFieldMap = {
  'fullName': 'displayof_name',
  'email': 'displayof_email',
  'attrs': 'displayof_tel',
  'campus': 'displayof_campus',
  'level.amount': 'displayof_xp',
  'xp.xpAmount': 'displayof_progress_text',
};


function bindFields(obj, fieldMap) {
    for (const [key, id] of Object.entries(fieldMap)) {
        const value = key.split('.').reduce((o, k) => o?.[k], obj);
        const el = document.getElementById(id);
        console.log();
        
        if (el) el.textContent = value || 'N/A';
    }
}

async function placeData() {
    const authToken = localStorage.getItem('auth.jwt');
    if (!authToken) {
        console.error("No authentication token found.");
        return;
    }
    await fetchData(basicInfo, authToken)
        .then(data => {
            console.log("Fetched user data:", data);
            const user = data.data.user[0] ;
            document.getElementById("displayof_username").textContent = `Hello, ${user.login}`;
            const level = data.data.level[0] || {};
            const xp = data.data.xp
            xp.xpAmount = `${xp.aggregate.sum.amount / 1000}kB`;
            user.fullName = `${user.lastName} ${user.firstName}`;
            const mergedData = {
                ...user,
                level,
                xp
            };
            bindFields(mergedData, userFieldMap);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}
        