var express = require('express');
var app = express();
var router = express.Router();


var verify = require('../middleware/authentication.js').verify;
var checkPreflight = require('../middleware/preflight.js').check;

var authentication = require('./controllers/authentication.js');
var ingredients = require('./controllers/ingredients.js');
var recipes = require('./controllers/recipes.js');
var users = require('./controllers/users.js');
var calculate = require('./controllers/calculate.js');

router.use('/authentication', checkPreflight, authentication);
router.use('/ingredients', checkPreflight, ingredients); // Removed verify,
router.use('/recipes', checkPreflight, recipes);
router.use('/users',checkPreflight, users); //  verify,
router.use('/calculate', checkPreflight, calculate); // verify,

module.exports = router;
