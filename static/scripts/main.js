import templates from "./templates.js";
import { checkAuth } from "./api/auth.js";
import "./helpers/utils.js";
import { fetchData } from "./api/getdata.js";
import { Info } from "./requests.js";
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
    auditRatio: "displayof_audit_ratio",
    "audits_succeeded.aggregate.count": "displayof_audit_successRate",
    "audits_failed.aggregate.count": "displayof_audit_failRate"
};

function bindFields(obj, fieldMap) {
    for (const [key, id] of Object.entries(fieldMap)) {
        var value = key.split(".").reduce((o, k) => o?.[k], obj);
        const el = document.getElementById(id);
        console.log(key, value);

        if (id === 'displayof_audit_ratio') {
            value = value.toFixed(2)
        }
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
    try {
        const data = await fetchData(Info, authToken);
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
        document.getElementById("displayof_audit_total").textContent =
            user.audits_succeeded.aggregate.count +
            user.audits_failed.aggregate.count;
        Projects = projects;
        await renderTransactions(data.data.projects[0]);
        updatePieChart([user.audits_succeeded.aggregate.count , user.audits_failed.aggregate.count], {
            colors: ['#809c13', '#ff0000']
        });
        // drawAuditLineGraph();

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
        type: tx.object?.type ?? ((tx.amount < 1000 && tx.amount > 0) ? "Exam exercice" : tx.amount > 1000 ? "Project" : "N/A"),
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

function updatePieChart(values, options = {}) {
    const total = values.reduce((a, b) => a + b, 0);
    const center = options.center || [150, 150];
    const outerRadius = options.outerRadius || 100;
    const innerRadius = options.innerRadius || 25;
    const colors = options.colors || ['#085f63', '#49beb7', '#facf5a', '#ff5959', '#ccc'];

    const svgNS = "http://www.w3.org/2000/svg";
    const pieGroup = document.getElementById("pieSlices");
    pieGroup.innerHTML = '';

    let startAngle = 0;

    values.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        const x0 = center[0] + outerRadius * Math.cos(startAngle);
        const y0 = center[1] + outerRadius * Math.sin(startAngle);
        const x1 = center[0] + outerRadius * Math.cos(endAngle);
        const y1 = center[1] + outerRadius * Math.sin(endAngle);

        const x2 = center[0] + innerRadius * Math.cos(endAngle);
        const y2 = center[1] + innerRadius * Math.sin(endAngle);
        const x3 = center[0] + innerRadius * Math.cos(startAngle);
        const y3 = center[1] + innerRadius * Math.sin(startAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', `
      M ${x0},${y0}
      A ${outerRadius},${outerRadius} 0 ${largeArc},1 ${x1},${y1}
      L ${x2},${y2}
      A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${x3},${y3}
      Z
    `);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('stroke', '#ccc');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('style', 'fill-opacity: 0.8; transition: fill-opacity 0.3s; cursor: pointer;');
        path.setAttribute('data-percentage', ((value / total) * 100).toFixed(1));
        path.setAttribute('data-label', `Section ${index + 1}`);
        path.setAttribute('title', `Section ${index + 1}: ${(value / total * 100).toFixed(1)}%`);

        pieGroup.appendChild(path);

        // Add label in the middle of the slice
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = center[0] + labelRadius * Math.cos(midAngle);
        const labelY = center[1] + labelRadius * Math.sin(midAngle);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('fill', '#000000');
        text.setAttribute('font-size', '14');
        text.textContent = `${((value / total) * 100).toFixed(1)}%`;

        pieGroup.appendChild(text);

        startAngle = endAngle;
    });
}

function drawAuditLineGraph() {
    const successText = document.getElementById('displayof_audit_successRate').textContent;
    const failText = document.getElementById('displayof_audit_failRate').textContent;

    const success = parseFloat(successText);
    const fail = parseFloat(failText);

    const svg = document.getElementById('auditLineGraph');
    svg.innerHTML = ''; // Clear old lines

    const totalWidth = 280;
    const xStart = 10;
    const y = 30;

    const successWidth = (success / 100) * totalWidth;
    const failWidth = (fail / 100) * totalWidth;

    const svgNS = 'http://www.w3.org/2000/svg';

    // Success line
    const successLine = document.createElementNS(svgNS, 'line');
    successLine.setAttribute('x1', xStart);
    successLine.setAttribute('y1', y);
    successLine.setAttribute('x2', xStart + successWidth);
    successLine.setAttribute('y2', y);
    successLine.setAttribute('stroke', 'green');
    successLine.setAttribute('stroke-width', 12);
    svg.appendChild(successLine);

    // Fail line
    const failLine = document.createElementNS(svgNS, 'line');
    failLine.setAttribute('x1', xStart + successWidth);
    failLine.setAttribute('y1', y);
    failLine.setAttribute('x2', xStart + successWidth + failWidth);
    failLine.setAttribute('y2', y);
    failLine.setAttribute('stroke', 'red');
    failLine.setAttribute('stroke-width', 12);
    svg.appendChild(failLine);

    // Optional: add text on the bar
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', totalWidth / 2);
    text.setAttribute('y', y - 10);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#333');
    text.textContent = `Success: ${success}% | Fail: ${fail}%`;
    svg.appendChild(text);
}
