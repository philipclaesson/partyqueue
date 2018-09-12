var router = require('express').Router(),
  mongoose = require('mongoose');
  Ingredient = mongoose.model('Ingredient');

const validUnits = {
  g: 1,
  hg: 100,
  kg: 1000,
}


// Calculate

// Should recieve a body like this:
/*
Ingredients: [
  {
      SLVID: Number,
      Name: String,
      Amount: Number,
      Unit: String,
      Variation: Number,
      Checksum: a variation checksum
    }
]

*/

router.post('/', function (req, res) {
    console.log("Hit /api/calculate/ [POST]");
    try {
      var CO2 = 0;
      var energy = 0;
      var itemsProcessed = 0;
      ingredients = req.body.ingredients;

      if (uniqueIds(ingredients) < 2) {
        return respondError(res, 400, 'Too few unique ingredients.')
      }
      ingredients.forEach(function (ingredient) {
        // Check types
        if (!isInteger(ingredient.Amount)){
          respondError(res, 400, ingredient.Amount + ' is not an integer.')
        }
        if (!getUnitWeight(ingredient.Unit)){
          respondError(res, 400, ingredient.Unit + ' is not a valid unit, use ' + validUnits)
        }
        Ingredient.find({SLVID: ingredient.SLVID}, function (err, foundIngredient){
          if (!err) {
            variation = foundIngredient[0].Variations[ingredient.Variation]
            if (variation) {
              // console.log(foundIngredient[0].Energi)
              energy += (foundIngredient[0].Energi * ingredient.Amount * getUnitWeight(ingredient.Unit))
              CO2 += (variation.CO2 * ingredient.Amount * getUnitWeight(ingredient.Unit))
              // console.log('CO2: ' + CO2)
              itemsProcessed++
              checkProcessedItems (res, CO2, energy, ingredients, itemsProcessed)
            } else {
              respondError(res, 404, 'Ingredient ' + Ingredient.SLVID + 'does not have a variation with id ' + ingredient.Variation)
            }
          } else {
            respondError(res, 404, 'Bad ingredient:' + Ingredient.SLVID)
          }
      })
    })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

function checkProcessedItems (res, CO2, energy, ingredients, itemsProcessed) {
  console.log("Checking items processed: " + itemsProcessed)
  if(itemsProcessed === ingredients.length) {
    // callback();
    console.log("Callback")
    respondSuccess(res, CO2, energy)
  }
}



function respondSuccess(res, CO2, energy){
  console.log("Success!")
  let body = {
      'energy': energy,
      'CO2': CO2,
      'klimatoScore': Math.round(100 * CO2 / (1000000 / 365)),
  }
  res.status(200).send(body)
}

function uniqueIds(ingredients) {
  var ids = new Set([])
  ingredients.forEach(function (ingredient) {
    ids.add(ingredient.SLVID)
  })
  return ids.size
}

function respondError(res, status, message, err){
  console.log("Error!")
  console.log(err)
  return res.status(status).json({
      success: false,
      message: message,
      error: err
  }).send();
}
try {
} catch (err) {
  return respondError(res, 400, 'Något gick fel. ', err)
}

function isInteger(data) {
  return (data === parseInt(data, 10))
}

function getUnitWeight(unit){
  return validUnits[unit]
}

module.exports = router;