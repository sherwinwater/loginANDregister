if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mysql = require("mysql");
const port = 3000;

//connect with mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "sam",
  password: "sam",
  database: "users"
});
db.connect();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  email => users.find(user => user.email == email),
  id => users.find(user => user.id == id)
);

// initializePassport(
//   passport,
//   email => result.find(user => user.email == email),
//   id => result.find(user => user.id == id)
// );

const users = [];

app.set("views engine", "ejs"); //views for ejs to template
app.use(express.urlencoded({ extended: false }));
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

var result = [];
app.get("/login", checkNotAuthenticated,  (req, res) => {
  try {
    //render users table from db
    const sql = "SELECT * FROM user";
     db.query(sql, (err, result) => {
      if (err) throw err;
      // res.send(result);
      res.render("login.ejs", { result: result });
      // console.log(result);
    });
  } catch {
    res.redirect("/login");
  }
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    //get users to db
    console.log("post request received at /comments");
    db.query(
      "INSERT INTO user VALUES (?, ?,?,?)",
      [Date.now().toString(), req.body.name, req.body.email, hashedPassword],
      function(err) {
        if (err) {
          console.log("error " + err);
        } else {
          res.status(200).redirect("/login");
        }
      }
    );
    // res.redirect("/login");  //repeat with the above code
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(port);
