require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
passport = require("passport");
MicrosoftStrategy = require("passport-microsoft").Strategy;
morgan = require("morgan");
methodOverride = require("method-override");
session = require("express-session");
const db = require("./database");

var MICROSOFT_GRAPH_CLIENT_ID = process.env.CLIENT_ID;
var MICROSOFT_GRAPH_CLIENT_SECRET = process.env.CLIENT_SECRET;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete Microsoft graph profile is
//   serialized and deserialized.
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(
    new MicrosoftStrategy(
        {
            clientID: MICROSOFT_GRAPH_CLIENT_ID,
            clientSecret: MICROSOFT_GRAPH_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/microsoft/callback",
            scope: ["user.read"],
        },
        function (accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(() => {
                // To keep the example simple, the user's Microsoft Graph profile is returned to
                // represent the logged-in user. In a typical application, you would want
                // to associate the Microsoft account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    )
);

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
    })
);

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/form", (req, res) => {
    res.render("form");
});

app.post("/form", (req, res) => {
    console.log(req.body);
    const { DocName, companyName, repName } = req.body;
    try {
        if (DocName && companyName && repName) {
            sql = `Insert INTO DocumentTableContent (DocName, CompanyName, RepName) 
                VALUES('${DocName}', '${companyName}', '${repName}')`;

            db.query(sql, (err, result) => {
                if (err) throw err;
                console.log(result);
            });
            // res.status(201).send({ msg: "Document Added" });
            res.redirect("/account");
        }
    } catch (err) {
        console.log(err);
    }
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

            db.promise().query(sql, (err, result) => {
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

app.get("/account", async (req, res) => {
    content = null;
    try {
        sql = `SELECT * FROM DocumentTableContent`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.render("account", { contents: result ? result : null });
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/account", ensureAuthenticated, (req, res) => {
    console.log(req.body);
});

// GET /auth/microsoft
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in Microsoft Graph authentication will involve
//   redirecting the user to the common Microsoft login endpoint. After authorization, Microsoft
//   will redirect the user back to this application at /auth/microsoft/callback
app.get(
    "/auth/microsoft",
    passport.authenticate("microsoft", {
        // Optionally add any authentication params here
        // prompt: 'select_account'
    }),
    // eslint-disable-next-line no-unused-vars
    (req, res) => {
        // The request will be redirected to Microsoft for authentication, so this
        // function will not be called.
    }
);

// GET /auth/microsoft/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
    "/auth/microsoft/callback",
    passport.authenticate("microsoft", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/account");
    }
);

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server started on port successfully");
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
