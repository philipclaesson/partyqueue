var router = require('express').Router(),
  Recipe = require('../../models/recipe.js'),
  mongoose = require('mongoose'),
  Ingredient = mongoose.model('Ingredient');


// /api/ingredients/ [GET]
router.get('/', function (req, res) {
    // Get all ingredients in database
    try {
      console.log("Request: /api/ingredients/ [GET]")
      Ingredient.find(
        { // These are the conditions (compare to the WHERE statement in SQL)
          // Primary: true,
          Class: { $gt: 0, $lt: 5 }
        },
        {
          SLVID: 1, // These are the fields we want to receive from the database
          text: 1, // We make sure to not make the response too heavy and to not reveal the CO2 value
          "Variations.ID": 1,
          "Variations.Organic": 1,
          "Variations.RegionID": 1,
          "Variations.RegionName": 1,
          "Variations.text": 1
      }/*,
      {
        $query: {}, $orderby: { "Class" : -1, "text": -1 }
      }*/, function (err, ingredients) {
        return res.status(200).json({
            success: true,
            message: "",
            data: ingredients
        })
      }).sort(
        { Index: 1
        }
      )
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

router.get('/:id/:production/:country', function (req, res) {
  // Get the ingredient with ID, Productiontype, Country
  try {
    console.log("Request: /api/ingredients/:id [GET]")
    query = {
      'ID': req.params.id,
      'ProductionType': req.params.production,
      'RegionName': req.params.country,
    }

    Ingredient.findOne(query, function (err, ingredient) {

      if (ingredient){
        res.status(200).json({
            success: true,
            message: "",
            data: ingredient
        }).send()
      } else {
        res.status(404).json({
            success: false,
            message: "There is no ingredient matching " + req.params.id + ', ' + req.params.production + ', ' + req.params.country,
            data: ingredient
        }).send()
      }
    })
  } catch (err) {
    return respondError(res, 400, 'Något gick fel. ', err)
  }
});

// /api/ingredients/id [GET]
router.get('/:id', function (req, res) {
    // Get all ingredients with a certain SLVID
  try {
    console.log("Request: /api/ingredients/:id [GET]")
    // console.log("Lets find Ingredient with ID" + req.params.id)
    Ingredient.find({'ID': req.params.id}, function (err, ingredients) {
      // console.log("Sending data")
      var ingredientMap = {};

      ingredients.forEach(function(ingredient) {
        ingredientMap[ingredient._id] = ingredient;
      });
      res.status(200).json({
          success: true,
          message: "",
          data: ingredientMap
      }).send()
    })
  } catch (err) {
    return respondError(res, 400, 'Något gick fel. ', err)
  }
});


// /api/ingredients/ [POST]
router.post('/', function (req, res) {
    console.log("To be implemented: /api/ingredients/ [POST]");
    res.status(501).send();
});

// /api/ingredients/id [PUT]
router.put('/:id', function (req, res) {
    console.log("To be implemented: /api/ingredients/id [PUT]");
    res.status(501).send();
});

// /api/ingredients/id [DELETE]
router.delete('/:id', function (req, res) {
    console.log("To be implemented: /api/ingredients/id [DELETE]");
    res.status(501).send();
});

function respondError(res, status, message, err){
  console.log("Error!")
  return res.status(status).json({
      success: false,
      message: message,
      error: err
  }).send();
}


module.exports = router;


