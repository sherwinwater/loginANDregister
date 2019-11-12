getUser();
function getUser() {
  $.get("/login", function(data) {
    if (!data) {
      console.log("no data");
    }
    console.log("received data");
    for (let i = 0; i < data.length; i++) {
      console.log(data[i].name);
    }
    showUser(data);
  });
}

function showUser(user) {
  var userSection = document.getElementById("user");
  for (var i = 0; i < user.length; i++) {
    var section = document.createElement("section");
    // section.className = "suggestion";
    var heading = document.createElement("h3");
    heading.innerHTML = user[i].name;
    var comment = document.createElement("p");
    comment.innerHTML = user[i].email;
    section.appendChild(heading);
    section.appendChild(comment);
    userSection.appendChild(section);
  }
}
