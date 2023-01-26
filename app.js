const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/form", (req, res) => {
    res.render("form");
});

app.post("/form", (req, res) => {
    console.log(req.body);
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    console.log(req.body);
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    console.log(req.body);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("Server started on port successfully");
});
