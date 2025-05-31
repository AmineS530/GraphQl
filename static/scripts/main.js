import templates from "./templates.js";
import { checkAuth } from "./api/auth.js";
import "./helpers/utils.js";
import { fetchData } from "./api/getdata.js";
import { Info } from "./requests.js";
import { showNotification } from "./helpers/utils.js";

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

function appendHeader() {
    const header = document.getElementById("header");
    if (header.querySelector(".header")) return;
    header.innerHTML = templates.header;
    document.body.style.overflow = "auto";
}

window.showCredits = function showCredits() {
    const creditsContainer = document.createElement("div");
    creditsContainer.className = "credits-container";
    creditsContainer.innerHTML = templates.creditsPage;

    document.body.appendChild(creditsContainer);

    creditsContainer.addEventListener("click", function () {
        document.body.removeChild(creditsContainer);
    });
};

window.logout = function logout(event) {
    event.preventDefault();

    document.getElementById("app").innerHTML = "";
    localStorage.removeItem("auth.jwt");
    document.getElementById("header").innerHTML = "";
    document.body.style.overflow = "hidden";
    check();
};

const userFieldMap = {
    fullName: "displayof_name",
    email: "displayof_email",
    attrs: "displayof_tel",
    campus: "displayof_campus",
    "level.amount": "displayof_xp",
    "xp.xpAmount": "displayof_progress_text",
    auditRatio: "displayof_audit_ratio",
    "audits_succeeded.aggregate.count": "displayof_audit_successRate",
    "audits_failed.aggregate.count": "displayof_audit_failRate",
};

function bindFields(obj, fieldMap) {
    for (const [key, id] of Object.entries(fieldMap)) {
        var value = key.split(".").reduce((o, k) => o?.[k], obj);
        const el = document.getElementById(id);
        // console.log(key, value);

        if (id === "displayof_audit_ratio") {
            value = value.toFixed(2);
        }
        if (el) el.textContent = value || "N/A";
    }
}

let sortState = {
    key: null,
    direction: 1,
};

let allTransactions = [];
let Projects = null;
let visibleCount = 5;

async function placeData() {
    const authToken = localStorage.getItem("auth.jwt");
    if (!authToken) {
        console.error("No authentication token found.");
        return;
    }
    try {
        const data = await fetchData(Info, authToken);

        const user = data.data.user[0];
        document.getElementById("username").textContent = `${String(user.login).charAt(0).toUpperCase() + String(user.login).slice(1)}'s Informations`;
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
        initSort();
        updatePieChart(
            [
                user.audits_succeeded.aggregate.count,
                user.audits_failed.aggregate.count,
            ],
            {
                colors: ["#48CAE4", "#0077B6"],
            }
        );
        drawRatioLineGraph(user.totalUp + user.totalUpBonus, user.totalDown);
        const rawTransactions = projects.transactions || [];

        const filteredProjects = rawTransactions
            .filter((tx) => tx.amount > 500)
            .map((tx) => ({
                name: tx.object?.name ?? "Unknown",
                amount: tx.amount,
                createdAt: tx.createdAt,
            }));

        drawModuleGraph(xp.aggregate.sum.amount, filteredProjects);
    } catch (error) {
        showNotification(
            error.message || "An error occurred while fetching user data.",
            "error"
        );
        check();
    }
}


async function renderTransactions(projectData) {
    const container = document.getElementById("displayof_last_transactions");
    container.innerHTML = "";

    const transactions = projectData?.transactions || [];
    allTransactions = transactions.map((tx) => ({
        name: tx.object?.name ?? "Unknown",
        date: tx.createdAt ?? "N/A",
        xp: tx.amount > 0 ? `${tx.amount / 1000}Kb` : "--" ?? 0,
        members:
            tx.object?.progresses?.[0]?.group?.members
                ?.map((m) => m.userLogin || m.login || m.username)
                .filter(Boolean)
                .join(", ") || "N/A",
        type:
            tx.object?.type ??
            (tx.amount < 1000 && tx.amount > 0
                ? "Exam exercice"
                : tx.amount > 1000
                    ? "Project"
                    : "Returned Project"),
    }));
    // Apply sorting if enabled
    if (sortState.key) {
        allTransactions.sort((a, b) => {
            if (sortState.key === "xp") {
                return (a.xp.slice(0, -2) - b.xp.slice(0, -2)) * sortState.direction;
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
    document
        .getElementById("showMoreLink")
        .addEventListener("click", async (e) => {
            e.preventDefault();
            visibleCount += 5;
            await displayVisibleItems();
        });
}

function initSort() {
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
}

function updatePieChart(values, options = {}) {
    const total = values.reduce((a, b) => a + b, 0);
    const center = 150
    const outerRadius = 100;
    const innerRadius =  25;
    const colors = options.colors;

    const svgNS = "http://www.w3.org/2000/svg";
    const pieGroup = document.getElementById("pieSlices");
    pieGroup.innerHTML = "";
    const legendContainer = document.getElementById("pieLegend");
    legendContainer.innerHTML = ""; // Clear old legend
    let startAngle = 0;

    values.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        const color = colors[index % colors.length];
        const percentage = ((value / total) * 100).toFixed(1);
        const label = index === 0 ? "Succeeded Audits" : `Failed Audits`;

        const x0 = center + outerRadius * Math.cos(startAngle);
        const y0 = center + outerRadius * Math.sin(startAngle);
        const x1 = center + outerRadius * Math.cos(endAngle);
        const y1 = center + outerRadius * Math.sin(endAngle);

        const x2 = center + innerRadius * Math.cos(endAngle);
        const y2 = center + innerRadius * Math.sin(endAngle);
        const x3 = center + innerRadius * Math.cos(startAngle);
        const y3 = center + innerRadius * Math.sin(startAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
            "d",
            `
      M ${x0},${y0}
      A ${outerRadius},${outerRadius} 0 ${largeArc},1 ${x1},${y1}
      L ${x2},${y2}
      A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${x3},${y3}
      Z
    `
        );
        path.setAttribute("fill", colors[index % colors.length]);
        path.setAttribute("stroke", "#ccc");
        path.setAttribute("stroke-width", "1");
        path.setAttribute(
            "style",
            "fill-opacity: 0.8; transition: fill-opacity 0.3s; cursor: pointer;"
        );
        path.setAttribute("data-percentage", ((value / total) * 100).toFixed(1));
        path.setAttribute("data-label", `${label}`);

        pieGroup.appendChild(path);

        // Add label in the middle of the slice
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = center + labelRadius * Math.cos(midAngle);
        const labelY = center + labelRadius * Math.sin(midAngle);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", labelX);
        text.setAttribute("y", labelY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "middle");
        text.setAttribute("fill", "#000000");
        text.setAttribute("font-size", "14");
        text.textContent = `${((value / total) * 100).toFixed(1)}%`;
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
    <span class="legend-color" style="background: ${color}"></span>
    <span class="legend-label">${label} — ${percentage}%</span>
  `;
        legendContainer.appendChild(item);
        pieGroup.appendChild(text);
        startAngle = endAngle;
    });
}

function drawRatioLineGraph(totalUp, totalDown) {
    const svg = document.getElementById("auditLineGraph");
    svg.innerHTML = "";

    const svgNS = "http://www.w3.org/2000/svg";
    const totalWidth = 400;
    const xStart = 10;
    const y = 30; 

    const total = totalUp + totalDown;
    const success = ((totalUp / total) * 100).toFixed(1);
    const fail = ((totalDown / total) * 100).toFixed(1);

    const successWidth = (success / 100) * totalWidth;
    const failWidth = (fail / 100) * totalWidth;

    // Success line
    const successLine = document.createElementNS(svgNS, "line");
    successLine.setAttribute("x1", xStart);
    successLine.setAttribute("y1", y);
    successLine.setAttribute("x2", xStart + successWidth);
    successLine.setAttribute("y2", y);
    successLine.setAttribute("stroke", "#48CAE4");
    successLine.setAttribute("stroke-width", 12);
    svg.appendChild(successLine);

    // Fail line
    const failLine = document.createElementNS(svgNS, "line");
    failLine.setAttribute("x1", xStart + successWidth);
    failLine.setAttribute("y1", y);
    failLine.setAttribute("x2", xStart + successWidth + failWidth);
    failLine.setAttribute("y2", y);
    failLine.setAttribute("stroke", "#0077B6");
    failLine.setAttribute("stroke-width", 12);
    svg.appendChild(failLine);

    // Line 1 (above the bar) – XP summary
    const topText = document.createElementNS(svgNS, "text");
    topText.setAttribute("x", totalWidth / 2);
    topText.setAttribute("y", y - 15);
    topText.setAttribute("text-anchor", "middle");
    topText.setAttribute("fill", "#00ccff"); 
    topText.setAttribute("font-size", "12");
    topText.textContent = `Audit XP gained: ${success}% | Audit XP lost: ${fail}%`;
    svg.appendChild(topText);

    // Line 2 (below the bar) – Ratio info
    const bottomText = document.createElementNS(svgNS, "text");
    bottomText.setAttribute("x", totalWidth / 2);
    bottomText.setAttribute("y", y + 25);
    bottomText.setAttribute("text-anchor", "middle");
    bottomText.setAttribute("fill", "#90E0EF");
    bottomText.setAttribute("font-size", "12");
    bottomText.textContent =
        totalUp > totalDown
            ? `Already at 1+ Ratio, Keep it up!`
            : `Need ${((totalDown - totalUp) / 1000).toFixed(
                0
            )}kB to reach 1.0 Ratio`;
    svg.appendChild(bottomText);
}

function drawModuleGraph(currentXP, projects) {
    const svg = document.getElementById("displayof_module");

    const svgNS = "http://www.w3.org/2000/svg";
    const width = 900;
    const height = 450;

    const startDate = new Date(projects[projects.length - 1].createdAt) - (10 * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const maxXP = Math.ceil(currentXP/1000) * 1.3;

    const leftPadding = 50;
    const rightPadding = 20;
    const topPadding = 30;
    const bottomPadding = 40;

    const graphWidth = width - leftPadding - rightPadding;
    const graphHeight = height - topPadding - bottomPadding;

    // Y-axis grid
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
        const y = height - bottomPadding - (graphHeight * i) / ySteps;
        const val = Math.round((maxXP * i) / ySteps);

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", leftPadding);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - rightPadding);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#444");
        line.setAttribute("stroke-dasharray", "3,3");
        svg.appendChild(line);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", leftPadding - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("fill", "#aaa");
        label.setAttribute("font-size", "12");
        label.textContent = val;
        svg.appendChild(label);
    }

    // X-axis grid + label (weekly steps)
    const xSteps = 5;
    for (let i = 0; i <= xSteps; i++) {
        const days = (dayCount / xSteps) * i;
        const date = new Date(startDate);
        date.setDate(date.getDate() + days);
        const x = leftPadding + (graphWidth * i) / xSteps;

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", topPadding);
        line.setAttribute("x2", x);
        line.setAttribute("y2", height - bottomPadding);
        line.setAttribute("stroke", "#444");
        line.setAttribute("stroke-dasharray", "3,3");
        svg.appendChild(line);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", height - bottomPadding + 15);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#aaa");
        label.setAttribute("font-size", "12");
        label.textContent = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        });
        svg.appendChild(label);
    }

    // === Plotting and connecting ===
    let cumulativeXP = 0;

    const points = projects
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((p) => {
            cumulativeXP += (p.amount/1000);
            const date = new Date(p.createdAt);
            const days = (date - startDate) / (1000 * 60 * 60 * 24);
            const x = leftPadding + (days / dayCount) * graphWidth;
            const y =
                height - bottomPadding - (cumulativeXP / maxXP) * graphHeight;
            return { x, y, cumulativeXP, ...p };
        });

    const path = document.createElementNS(svgNS, "path");
    const d = [
        `M ${leftPadding} ${height - bottomPadding}`,
        ...points.map((pt) => `L ${pt.x} ${pt.y}`),
    ].join(" ");

    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#4e71ff");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);

    // Draw circles
    points.forEach((pt) => {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "#4e71ff");
        circle.setAttribute("stroke", "#fff");
        circle.setAttribute("stroke-width", 1.5);

        const title = document.createElementNS(svgNS, "title");
        const formattedDate = new Date(pt.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        title.textContent = `name: ${pt.name}\nxp: ${pt.amount / 1000
            }kB\ndate: ${formattedDate}`;
        circle.appendChild(title);

        svg.appendChild(circle);
    });
}
