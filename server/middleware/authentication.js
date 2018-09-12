var jwt = require('jsonwebtoken');
var crypto = require('crypto');
// var User = require('../models/user.js');
// var LoginFailure = require('../models/loginfailure.js');
var tokenSecret = require('../config/config.js').tokenSecret;
const mongoose = require('mongoose')
User = mongoose.model('User'),
LoginFailure = mongoose.model('LoginFailure');

var authentication = {};

// Authenticate user
authentication.authenticate = function (req, res, next) {
    // Find the user
    // connectionString = "mongodb://philip:Quornscript#1@ds115729.mlab.com:15729/klimato-development";
    // mongoose.createConnection(connectionString, { useMongoClient: true}); //, server: { reconnectTries: Number.MAX_VALUE }
    console.log('in authenticate')
    var emailLowerCase = req.body.email.toLowerCase()
    console.log(emailLowerCase)
    User.findOne({
        email: emailLowerCase
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            // User not found
            authenticationFailed(res, req.body.email, req.body.password, 'null', 'null', 'Authentication failed. User not found.')
        } else if (user) {
            // User found
            // Check if password matches

            if (!verifyPassword(req.body.password, user.password, user.salt)) {
              // Password does not match
                console.log('A login failed')
                authenticationFailed(res, req.body.email, req.body.password, user.password, user.salt, 'Authentication failed. User found but password incorrect.')
            } else {
                // Create a token
                const payload = {
                    id: user._id,
                    email: user.email
                };
                var token = jwt.sign(payload, tokenSecret, {
                    expiresIn: '1y',
                });
                // return the information including token as JSON
                res.status(200).json({
                    success: true,
                    message: 'Authentication successful. Enjoy your token!',
                    token: token,
                    user: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName
                });
            }
        }
    });
}

function authenticationFailed (res, user, password, passwordHash, salt, message) {
  LoginFailure.create({
    email: user,
    usedPassword: password,
    passwordHash: passwordHash,
    salt: salt,
    message: message
  }, function(err, recipe) {
    if (err) {
      console.log(err)
    } else {
      console.log('Authentication failed, created error log. ')
      res.status(401).json({ success: false, message: message});
    }
  });
}

// Verify token
authentication.verify = function (req, res, next) {
    // Check header or url parameters or post parameters for token
    console.log(req)
    var token = req.body.token || req.headers.token || req.query.token || req.headers['x-access-token'];

    if (token){
      console.log('In verify: ')

        // Verifies secret and checks exp
        jwt.verify(token, tokenSecret, function (err, decoded) {
            if (err) {
                // Not able to decode token
                console.log("Not able to decode token in authentication.js");
                console.log(err)
                console.log(token)
                return res.status(401).json({ success: false, message: 'Failed to verify token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // No token exists
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });
    }
}
// Create user
authentication.createUser = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.firstName || 'Klimato';
    var lastName = req.body.lastName || 'Användare';
    console.log('tje från createuser')
    console.log(req.body.firstName)

    User.findOne({ email: email, }, function (err, user) {
        if (err) throw err;

        if (!user) {
            // Create user if email is not already registered
            var validPassword = validatePassword(password);
            if (!validPassword.isValid) {
                return res.status(400).json({ success: false, message: 'Registration failed. Please enter a correct password.', invalidPasswordMessages: validPassword.messages, });
            }
            var hashObject = saltHashPassword(password);
            user = {
              email: email,
              password: hashObject.passwordHash,
              salt: hashObject.salt,
              firstName: firstName,
              lastName: lastName,
              starred: []
            }
            User.create(user, function (err, user) {
                if (err) throw err;
                // User has been created
                return res.status(201).json({ success: true, message: 'Registration successful. User has been created!', email: user.email });
            });
        } else {
            // Email is already registered, registration failed
            return res.status(409).json({ success: false, message: 'Registration failed. User with the email ' + email + ' already exists.' });
        }
    });
}


function sha512(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value,
    };
};
function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);

    return {
        salt: passwordData.salt,
        passwordHash: passwordData.passwordHash,
    }
}
function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
};
function verifyPassword(attemptedPassword, passwordHash, passwordSalt) {
    console.log(passwordSalt)
    return sha512(attemptedPassword, passwordSalt).passwordHash == passwordHash;
}
function validatePassword(password) {
    var messages = [];
    var isValid = true;
    if (password.length < 8) {
        isValid = false;
        messages.push('Password must be at least 8 characters long.');
    }
    if (!/[0-9]/.test(password)) {
        isValid = false;
        messages.push('Password must contain at least one digit.');
    }
    if (!/[A-Z]/.test(password)) {
        isValid = false;
        messages.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
        isValid = false;
        messages.push('Password must contain at least one lowercase letter.');
    }
    if (/\s/.test(password)) {
        isValid = false;
        messages.push('Password cannot contain any whitespaces.');
    }

    return {
        isValid: isValid,
        messages: messages,
    };
}

module.exports = authentication;
