const loginPage = `
<form autocomplete='off' method="POST" class='form'>
 <div class="control">
  <img class="logo" src="static/images/logo.png" alt="Logo">
  <h1>Sign In</h1>
</div>
  <div class='control block-cube block-input'>
    <input name='usernameOrEmail' placeholder='Username Or Email' type='text' required>
    <div class='bg-top'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg-right'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg'>
      <div class='bg-inner'></div>
    </div>
  </div>
  <div class='control block-cube block-input'>
    <input type="password" placeholder="Password" name="password" required />
    <i class="togglePwd" > <span class="icon material-symbols-outlined">visibility</span></i>
    <div class='bg-top'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg-right'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg'>
      <div class='bg-inner'></div>
    </div>
  </div>
  <button type="submit" id="loginBtn" onclick="login(event)" class='btn block-cube block-cube-hover'  >
    <div class='bg-top'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg-right'>
      <div class='bg-inner'></div>
    </div>
    <div class='bg'>
      <div class='bg-inner'></div>
    </div>
    <div class='text'>
      Log In
    </div>
  </button>
</form>
`;

const creditsPage = `
<div class='overlay'>
  <div class='credits'>
    <h2>Credits</h2>
    <p>Base design imported from</p>
    <ul>
      <li><a href='https://codepen.io/marko-zub/' target='_blank'>Marko Zub</a></li>
      <li><a href='https://codepen.io/sarazond' target='_blank'>Sarazond</a></li>
    </ul>
  </div>
</div>
`;

const header = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<div class='header'>
  <h1>GraphQl</h1>
  <button class='btn' onclick='logout(event)'>
    Logout
    <i class="fa-sharp fa-solid fa-right-from-bracket"></i>
  </button>
</div>
`;

const profilePage = `
<div class="pp-container">
    <div class="pp-flex-row">
        <div class="pp-section pp-level-box">
            <h2 class="pp-title">Current Level</h2>
            <h3 id="displayof_xp" class="pp-circle">0</h3>
            <div class="pp-progress-bar">
                <div class="pp-progress-label">XP amount</div>
                <span id="displayof_progress_text">0kb</span>
            </div>
        </div>

        <div class="pp-section pp-info-box">
            <h2 class="pp-title" id="username">Basic Informations</h2>
            <table class="pp-table">
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td id="displayof_name">N/A</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td id="displayof_email">N/A</td>
                    </tr>
                    <tr>
                        <td>Phone Number</td>
                        <td id="displayof_tel">N/A</td>
                    </tr>
                    <tr>
                        <td>Campus</td>
                        <td id="displayof_campus">N/A</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="pp-section">
        <h2 class="pp-title">Last Transactions</h2>
        <table class="pp-table">
            <thead>
                <tr>
                    <th data-sort="name">Name</th>
                    <th data-sort="date">Date</th>
                    <th data-sort="xp">XP</th>
                    <th data-sort="members">Members</th>
                    <th data-sort="type">Type</th>
                </tr>
            </thead>
            <tbody id="displayof_last_transactions"></tbody>
        </table>
        <div class="table-footer">
            <a href="#" id="showMoreLink" style="display: none">Show More...</a>
        </div>
    </div>

    <div class="pp-section">
        <h2 class="pp-title">Audit Statistics</h2>
        <table class="pp-table">
            <tbody>
                <tr>
                    <td>Audit Ratio</td>
                    <td id="displayof_audit_ratio">0</td>
                </tr>
                <tr>
                    <td>Total Audits</td>
                    <td id="displayof_audit_total">0</td>
                </tr>
                <tr>
                    <td>Success Rate</td>
                    <td id="displayof_audit_successRate" style="color: green">0 %</td>
                </tr>
                <tr>
                    <td>Fail Rate</td>
                    <td id="displayof_audit_failRate" style="color: red">0 %</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="pp-section">
        <h2 class="pp-title">Module</h2>
        <h3 id="displayof_module_time"></h3>
        <svg id="dispalyof_module" class="pp-graph" width="900" height="450" viewBox="0 0 900 450"
            xmlns="http://www.w3.org/2000/svg">
            <!-- existing SVG content -->
        </svg>
    </div>

    <div class="pp-section">
        <h2 class="pp-title">Skills</h2>
        <span id="displayof_graph_display">
            <svg class="pp-graph" width="900" height="450" viewBox="0 0 900 450" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#333" />
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="7em" fill="#888">
                    No data yet
                </text>
            </svg>
        </span>
    </div>
</div>
`;

export default { loginPage, creditsPage, profilePage, header };
