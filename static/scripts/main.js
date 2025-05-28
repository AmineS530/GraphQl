import templates from "./templates.js";
import { checkAuth } from "./api/auth.js";
import "./helpers/utils.js";
import { fetchData } from "./api/getdata.js";
import { basicInfo } from "./requests.js";
import { showNotification } from "./helpers/utils.js";

let sortState = {
    key: null,
    direction: 1,
};

let Projects = null;

export async function loadPage(page, event) {
    if (event) {
        event.preventDefault();
    }
    const authToken = localStorage.getItem("auth.jwt");
    const Authenticated = checkAuth(authToken);
    const app = document.getElementById("app");

    if (page === "auth" && Authenticated) {
        loadPage("home", event);
        return;
    }

    if (page === "home" && !Authenticated) {
        localStorage.removeItem("auth.jwt");
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

check();

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
    const header = document.getElementById("header");
    if (header.querySelector(".header")) return;
    header.innerHTML = templates.header;
    document.body.style.overflow = "auto";
}

const userFieldMap = {
    fullName: "displayof_name",
    email: "displayof_email",
    attrs: "displayof_tel",
    campus: "displayof_campus",
    "level.amount": "displayof_xp",
    "xp.xpAmount": "displayof_progress_text",
};

function bindFields(obj, fieldMap) {
    for (const [key, id] of Object.entries(fieldMap)) {
        const value = key.split(".").reduce((o, k) => o?.[k], obj);
        const el = document.getElementById(id);
        if (el) el.textContent = value || "N/A";
    }
}

function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function placeData() {
    const authToken = localStorage.getItem("auth.jwt");
    if (!authToken) {
        console.error("No authentication token found.");
        return;
    }
    await fetchData(basicInfo, authToken);
    try {
        const data = await fetchData(basicInfo, authToken);
        console.log("Fetched user data:", data);

        const user = data.data.user[0];
        document.getElementById("username").textContent = `${Capitalize(user.login)}'s Informations`;
        const level = data.data.level[0] || {};
        const xp = data.data.xp;
        const projects = data.data.projects?.[0];
        xp.xpAmount = `${(xp.aggregate.sum.amount / 1000).toFixed(0)}kB`;
        user.fullName = `${user.lastName} ${user.firstName}`;
        const mergedData = {
            ...user,
            level,
            xp,
        };
        bindFields(mergedData, userFieldMap);
        Projects = projects;
        await renderTransactions(data.data.projects[0]);
    } catch (error) {
        showNotification(
            error.message || "An error occurred while fetching user data.",
            "error"
        );
    }
}

let visibleCount = 5;
let allTransactions = [];

async function renderTransactions(projectData) {
    const container = document.getElementById("displayof_last_transactions");
    container.innerHTML = "";

    const transactions = projectData?.transactions || [];
    allTransactions = transactions.map((tx) => ({
        name: tx.object?.name ?? "Unknown",
        date: tx.createdAt ?? "N/A",
        xp: tx.amount ?? 0,
        members:
            tx.object?.progresses?.[0]?.group?.members
                ?.map((m) => m.userLogin || m.login || m.username)
                .filter(Boolean)
                .join(", ") || "N/A",
        type: tx.object?.type ?? (tx.amount < 1000 ? "Exam exercice" : "Project"),
    }));
    // Apply sorting if enabled
    if (sortState.key) {
        allTransactions.sort((a, b) => {
            if (sortState.key === "xp") {
                return (a.xp - b.xp) * sortState.direction;
            }
            const aVal = a[sortState.key]?.toString().toLowerCase();
            const bVal = b[sortState.key]?.toString().toLowerCase();
            return aVal > bVal
                ? sortState.direction
                : aVal < bVal
                    ? -sortState.direction
                    : 0;
        });
    }
    displayVisibleItems();
}

document.querySelectorAll("[data-sort]").forEach((th) => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (sortState.key === key) {
            sortState.direction *= -1;
        } else {
            sortState.key = key;
            sortState.direction = 1;
        }
        renderTransactions(Projects);
    });
});

document.getElementById("showMoreLink").addEventListener("click", async (e) => {
    e.preventDefault(); 
    visibleCount += 5;
    await displayVisibleItems();
});
async function displayVisibleItems() {
    const container = document.getElementById("displayof_last_transactions");
    container.innerHTML = "";

    // Slice the data to show only `visibleCount` items
    const visibleItems = allTransactions.slice(0, visibleCount);

    visibleItems.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.date.split("T")[0]}</td>
      <td>${row.xp}</td>
      <td>${row.members}</td>
      <td>${row.type}</td>
    `;
        container.appendChild(tr);
    });

    // Show/hide "Show More" link
    const showMoreLink = document.getElementById("showMoreLink");
    if (visibleCount < allTransactions.length) {
        showMoreLink.style.display = "inline";
    } else {
        showMoreLink.style.display = "none";
    }
}