const loginPage = `
<form autocomplete='off' class='form'>
 <div class="control">
  <img class="logo" src="static/images/logo.png" alt="Logo">
  <h1>Sign In</h1>
</div>
  <div class='control block-cube block-input'>
    <input name='usernameOrEmail' placeholder='Username Or Email' type='text'>
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
    <input name='password' placeholder='Password' type='password'>
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
  <button id="loginBtn" class='btn block-cube block-cube-hover' type='button'>
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

const creditsPage = `
<div class='credits'>
  <a href='https://codepen.io/marko-zub/' target='_blank'>
    Login Page from CodePen
  </a>
</div>
`

export default {loginPage, creditsPage}