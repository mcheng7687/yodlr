const $logout = $("#logout");

defaultInitialize();

function defaultInitialize() {
  if (admin.user === localStorage.getItem("yodlr")) {
    $logout.toggleClass('hidden');
  }
}

/**
* Event handler for logging out admin.
* 
*/
$logout.on("click", function () {
  localStorage.removeItem("yodlr");
});

