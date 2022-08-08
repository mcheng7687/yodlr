// Constant global variables taken from constants.js are:
// "USER_URL"
// "admin" as { user, password }

const $users = $("#users");
const $searchForm = $("#search-form");
const $adminForm = $("#admin-form");

initialize();

function initialize() {
  if (admin.user === localStorage.getItem("yodlr")) {
    // Unhide users list and remove admin login
    $users.toggleClass('hidden');
    $searchForm.toggleClass('hidden');
    $adminForm.remove();

    // Initialize DOM with list info
    sortUsers();
  }
  else {
    $adminForm.toggleClass('hidden');
  }
}

/**
 * Get list of users from USER_URL.
 * 
 * Returns array of users with [{id, email, firstName, lastName, state}, ...]
 */
async function getUsers() {
  const users = await axios.get(USER_URL);

  return users.data;
}

/**
 * Update user with id.
 * 
 * Return user info with {id, email, firstName, lastName, state}
 */
async function updateUser(user) {
  const updatedUser = await axios.put(`${USER_URL}/${user.id}`, user);

  return updatedUser.data;
}

/**
 * Get specific user info.
 * 
 * Return user info with {id}
 */
async function deleteUser(user) {
  const removedUser = await axios.delete(`${USER_URL}/${user.id}`, user);

  return removedUser.data;
}

/**
 * Remove users from DOM table with id = "users".
 * 
 * Removes all "tr" elements except for header row. 
 */
function removeUsers() {
  const $tr = $("tr");

  $tr.each(index => {
    if ($tr[index].id !== "headers") $tr[index].remove();
  });
}

/**
 * Sorts users based on category and ascending/descending values. 
 * Include only users that include searchTerm in lastName or firstName if provided.
 * 
 * Appends to DOM table with id = "users".
 * Each user will display lastName, firstName, email, and state.
 */
function sortUsers(category = 'lastName', ascending = true, searchTerm = '') {
  removeUsers();

  Promise.resolve(getUsers()).then((users) => {

    users.sort((u1, u2) => {
      return ascending ?
        (u1[category].toLowerCase() > u2[category].toLowerCase() ? 1 : -1) :
        (u1[category].toLowerCase() < u2[category].toLowerCase() ? 1 : -1);
    });

    for (let user of users) {
      if (user.firstName.toLowerCase().includes(searchTerm) || user.lastName.toLowerCase().includes(searchTerm)) {
        let $user = $(`
          <tr id=${user.id}>
            <td class='left-side'>${user.lastName}</td>
            <td class='left-side'>${user.firstName}</td>
            <td class='left-side'>${user.email}</td>
            <td class='right-side'>${user.state === 'pending' ?
            '<button type="button" class="btn btn-outline-warning">Pending</button>' :
            '<button type="button" class="btn btn-success done">Active</button>'}
            </td>
            <td class='left-side'><button type="button" class="btn btn-danger">Delete</button></td>
          </tr>`);

        $users.append($user);
      }
    }
  });
}

/**
 * Event handler for admin form login.
 * 
 */
$adminForm.on("submit", async function (evt) {
  evt.preventDefault();

  if (admin.user === $('#admin').val() && admin.password === $('#current-password').val()) {
    localStorage.setItem("yodlr", $('#admin').val());
    defaultInitialize();
    initialize();
  }
  else alert("Incorrect user/password combination.")
});

/**
 * Event handler for search form. Sort based on acsending category lastName. 
 * 
 */
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();

  removeUsers();

  sortUsers('lastName', true, $('#search').val().toLowerCase());
});

/**
 * Event handler for users DOM table.
 * 
 * If state button selected with "Pending", sets button to "Active" and updates backend.
 * 
 * If delete button selected, removes user from DOM and backend.
 * 
 * If category header selected (ie. "Last Name" or "First Name"), 
 * sorts user list according to selected ascending category values. If already 
 * sorted on the selected category, change to descending order.
 */
$users.on("click", function (evt) {
  if (evt.target.innerText === 'Pending') {
    updateUser({ id: evt.target.parentElement.parentElement.id, state: "active" });
    evt.target.className = 'btn btn-success disabled';
    evt.target.innerText = 'Active';
    console.log(`Change status to 'Active'.`);
  }
  else if (evt.target.innerText === 'Delete') {
    let id = evt.target.parentElement.parentElement.id;
    deleteUser({id});
    $(`#${id}`).remove();
    console.log(`Removed user ${id}.`);
  }
  else if (evt.target.parentElement.className.includes('category')) {
    
    if (evt.target.parentElement.children.length > 1) {
      evt.target.parentElement.children[1].classList.toggle('fa-chevron-up');
      evt.target.parentElement.children[1].classList.toggle('fa-chevron-down');

      sortUsers(evt.target.parentElement.id, evt.target.parentElement.children[1].className.includes("up"));

      console.log(`Sort ${evt.target.innerText} by ${evt.target.parentElement.children[1].className.includes("up") ? 'ascending' : 'descending'} values.`);
    }
    else {
      sortUsers(evt.target.parentElement.id);

      let $prevCategory = $(".btn-primary");
      $prevCategory.toggleClass('btn-primary');
      $prevCategory.toggleClass('btn-secondary');
      evt.target.classList.toggle('btn-secondary');
      evt.target.classList.toggle('btn-primary');

      $("i").remove();
      evt.target.parentElement.innerHTML += `<i class="fas fa-chevron-up"></i>`;

      console.log(`Sort based on ${evt.target.innerText} by ascending values.`);
    }
  }
});
