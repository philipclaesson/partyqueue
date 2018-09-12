var router = require('express').Router(),
  mongoose = require('mongoose'),
  Recipe = mongoose.model('Recipe');
/* Använd inte denna fil just nu!*/

// /api/recipes/ [GET]
router.get('/', function (req, res) {
    // Return a list of all public recipes
    try {
      Recipe.find({'Public': true}, function (err, recipes){ //
        console.log('recipe:')
        console.log(recipes)
        res.status(200).json({
            success: true,
            message: "",
            data: recipes
        }).send();
      })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

router.get('/klimato/', function (req, res) {
    // Return a list of all klimato recipes
    try {
      Recipe.find({'Klimato': true}, function (err, recipes){ //
        console.log('recipe:')
        // console.log(recipes)
        res.status(200).json({
            success: true,
            message: "",
            data: recipes
        }).send();
      })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

// /api/recipes/id [GET]
router.get('/:id', function (req, res) {
    // Return the specified recipe
  try {
    // Return the specific recipe if it is public
    var rid = req.params.id //_id(?)

    Recipe.find({'Public': true, '_id': rid}, function (err, recipes){ //
      console.log('recipe:')
      // console.log(recipes)
      var recipeIdMap = {};

      recipes.forEach(function(recipe){
        recipeIdMap[recipe._id] = recipe;
      });
      if (recipes.length > 0) {
        res.status(200).json({
            success: true,
            message: "",
            data: recipeIdMap
        }).send();
      } else {
        return respondError(res, 400, 'Receptet existerar inte, eller är inte offentligt. ', 'Access Denied')
      }
    })
  } catch (err) {
    return respondError(res, 400, 'Receptet existerar inte, eller är inte offentligt. ', err)
  }
});


// /api/recipes/ [POST]
router.post('/', function (req, res) {
    // CREATE the recipe
    console.log("To be implemented: /api/recipes/ [POST]");
    res.status(501).send();
});

// /api/recipes/id [PUT]
router.put('/:id', function (req, res) {
    // UPDATE the specified recipe
    console.log("To be implemented: /api/recipes/id [PUT]");
    res.status(501).send();
});

// /api/recipes/id [DELETE]
router.delete('/:id', function (req, res) {
    // DELETE the specified recipe
    console.log("To be implemented: /api/recipes/id [DELETE]");
    res.status(501).send();
});

function respondError(res, status, message, err){
  console.log("Error!")
  console.log(message)
  console.log(err)
  return res.status(status).json({
      success: false,
      message: message,
      error: err
  }).send();
}

// /api/recipes/ [GET]
router.get('/', function (req, res) {
    // Return a list of all recipes
    console.log("To be implemented: /api/recipes/ [GET]");
    res.status(501).send();
});



module.exports = router;
