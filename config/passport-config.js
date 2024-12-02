const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Replace with database query functions
async function getUserByEmail(email, db) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
}

async function getUserById(id, db) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
}

function initialize(passport, db) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email, db);
        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        const user = await getUserById(id, db);
        done(null, user);
    });
}

module.exports = initialize;
