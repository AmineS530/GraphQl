import templates from "./templates.js";
import "./auth.js"
import "./utils.js";

window.loadPage = function (page, event) {
    if (event) {
        event.preventDefault();
    }
    //todo: verify/check expirym force logout (delete token on failure)
    // set interval to how frequent to check the token
    // const check = localStorage.getItem('auth.jwt');
    // console.log(check);

    switch (page) {
        case "home":
            document.body.innerHTML = templates.background + templates.profilePage // templates.footer;
            appendHeader();
            break;
        case "auth":
            document.body.innerHTML = templates.background + templates.loginPage //+ templates.footer;
            break;
        default:
            break;
    }
    appendFooter();
};

function appendHeader() {
  const header = document.createElement('header');
  header.innerHTML = templates.header;
  document.body.insertBefore(header, document.body.firstChild);
}


 function appendFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = templates.footer;
  document.body.appendChild(footer);
}


if (!localStorage.getItem('auth.jwt')) {
    loadPage("auth");
} else {
    loadPage("home");
    checkAuth();
}

window.showCredits = function showCredits() {
    const creditsContainer = document.createElement('div');
    creditsContainer.className = 'credits-container';
    creditsContainer.innerHTML = templates.creditsPage;

    document.body.appendChild(creditsContainer);

    creditsContainer.addEventListener('click', function () {
        document.body.removeChild(creditsContainer);
    });
}


