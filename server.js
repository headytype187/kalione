const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const initializePassport = require('./config/passport-config');
const app = express();
const port = 3003;

// Database connection
const db = mysql.createConnection({
    host: 'mysql-eba80b2-kalione.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_XPuVaPTO_Dm1h8zhu7r',
    database: 'defaultdb',
    port: 15552,
    connectTimeout: 30000
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Initialize Passport with user fetching functions
const users = [];
initializePassport(passport, db);

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Middleware to check authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPassword
        };

        // Insert newUser data into the database
        const query = 'INSERT INTO Users (id, email, password) VALUES (?, ?, ?)';
        db.query(query, [newUser.id, newUser.email, newUser.password], (err, result) => {
            if (err) {
                console.error('Error inserting data into the database:', err);
                res.redirect('/signup');
                return;
            }
            console.log('User added to database:', newUser);
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error during signup process:', error);
        res.redirect('/signup');
    }
});

app.get('/user-info', (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(403).send('Unauthorized');
    } else {
        res.json({ email: req.user.email });
    }
});

app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});