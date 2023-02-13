require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const db = require("./database");

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
    const { email, companyName, name, password } = req.body;
    console.log(req.body);
    try {
        if (email && password && companyName && name) {
            sql = `Insert INTO USERS (Email, Name, CompanyName, Password) 
                VALUES('${email}', '${name}', '${companyName}', '${password}')`;

            db.query(sql, (err, result) => {
                if (err) throw err;
                console.log(result);
            });
            res.status(201).send({ msg: "Register for user" });
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {});

app.get("/table", (req, res) => {
    res.render("table");
});

app.post("/table", (req, res) => {
    console.log(req.body);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("Server started on port successfully");
});
