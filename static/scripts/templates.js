const loginPage = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" /> 

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
`

const background = `
<link href='https://fonts.googleapis.com/css?family=Lato:300,400,700' rel='stylesheet' type='text/css'>
<div id='stars'></div>
<div id='stars2'></div>
<div id='stars3'></div>
</div>
`
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
    <i class="fa-sharp fa-solid fa-right-from-bracket"></i>
    Logout
  </button>
</div>
`


const profilePage = `
<div class='profile'>
  <h1>Welcome, User!</h1>
  <p>This is your profile page.</p>
</div>
`

export default { loginPage, background, creditsPage, profilePage, header };