// Constant global variables taken from constants.js are:
// "USER_URL"

const $registerForm = $("#register-form");

/**
 * POST register form a new user to USER_URL.
 * 
 * Logs to console user data with {id, email, firstName, lastName, state}
 */

$registerForm.on("submit", async function registerNewUser(evt) {
  evt.preventDefault();

  let email = $("#email").val(), firstName = $("#firstName").val(), lastName = $("#lastName").val();

  if (email !== "" && firstName !== "" && lastName !== "") {
    await axios.post(USER_URL, { email, firstName, lastName });

    $("#email").val("");
    $("#firstName").val("");
    $("#lastName").val("");
  }
  else {
    alert(`Must provide all fields.`)
  }
});

