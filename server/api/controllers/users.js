var router = require('express').Router(),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Report = mongoose.model('Report'),
  Recipe = mongoose.model('Recipe');



// /api/users/ [GET]
router.get('/', function (req, res) {
    //request i postman: http://localhost:3001/api/users/
    try {
      // Return a list of all users
      console.log('GET USERS')

      User.find({}, function (err, users){
        var userMap = {};
        if (err) {
          res.status(404).json({
              success: false,
              message: "Users not found"
          }).send();

        } else {

        users.forEach(function(user){
          userMap[user.id] = user;
        });
        res.status(200).json({
            success: true,
            message: "",
            data: userMap
        }).send();
      }
    })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

// /api/users/id [GET]
router.get('/:id', function (req, res) {
  //request i postman: http://localhost:3001/api/users/:id
  var id = req.params.id

  User.find({'_id': id}, function (err, user){
    var userIdMap = {};

    // Här är ett exempel på felhantering, kolla igenom de andra funktionerna och lägg in liknande felhantering.
    if (err) {
      res.status(404).json({
          success: false,
          message: "User not found"
      }).send();

    } else {
      user.forEach(function(user){
        userIdMap[user._id] = user;

      });
      res.status(200).json({
          success: true,
          message: "",
          data: userIdMap
      }).send();
    }
  })
});


// /api/users/ [POST]
router.post('/', function (req, res) {
    // CREATE the user
    console.log("To be implemented: /api/users/ [POST]");
    res.status(501).send();
});

// /api/users/id [PUT]
router.put('/:id', function (req, res) {
  // Jakob testar att implementera denna - gör så att man kan uppdatera epost.
    // UPDATE the email adress of the specified user
    console.log("To be implemented: /api/users/id [PUT]");
    res.status(501).send();
});

// /api/users/id [DELETE]
router.delete('/:id', function (req, res) {
    // DELETE the specified user
    console.log("To be implemented: /api/users/id [DELETE]");
    res.status(501).send();
});



/* Recipes endpoints! */

// /api/users/id/recipes [GET]
router.get('/:uid/recipes/', function (req, res) {
    //request i postman: http://localhost:3001/api/users/5aad4c09e6417c1138b4b01d/recipes/
    try {
      console.log("hit  /api/users/id/recipes [GET]")
      // Return all recipes for the user
      var uid = req.params.uid

      Recipe.find({'User': uid}, function (err, foundRecipes){
        var recipes = [];

        foundRecipes.forEach(function(recipe){
          if (!recipe.Archived){
            recipes.push(recipe);
          }
        });
        console.log(foundRecipes)
        try {
          res.status(200).json({
              success: true,
              message: "",
              data: recipes
          }).send();
        } catch (err) { // Catching Error: Can't remove headers after they are sent here.. Investigate.
          console.log('Caught ' + err)
        }

      })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});



// /api/users/id/recipes/id [GET]
router.get('/:uid/recipes/:rid', function (req, res) {
    // Request i postman: http://localhost:3001/api/users/5aad4c09e6417c1138b4b01d/recipes/5acbabbc099f56364dfe9614

    try {
      // Return the specific recipe for the specified user
      var uid = req.params.uid
      var rid = req.params.rid //_id(?)

      Recipe.find({'_id': rid}, function (err, recipes){
        var recipeIdMap = {};
        // console.log(recipes)
        recipes.forEach(function(recipe){
          if (recipe.User === uid || recipe.Klimato || recipe.Public){
            recipeIdMap[recipe._id] = recipe;
          }
        })
        res.status(200).json({
            success: true,
            message: "",
            data: recipeIdMap
        }).send();

       {

      recipes.forEach(function(recipe){
        recipeIdMap[recipe._id] = recipe;
      });
      res.status(200).json({
          success: true,
          message: "",
          data: recipeIdMap
      }).send();
    }
  })

    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

// /api/users/recipes [POST]
router.post('/:uid/recipes', function (req, res) {
  console.log('hit /api/users/recipes [POST]')
  try {
    console.log('i post recipe')
    var uid = req.params.uid;
    User.findOne({ _id: uid }, function(err, user) {
      if (!user){
        return res.status(400).json({success: false, message: 'Did not find user ' + uid })
      }

      var recipe = req.body.recipe
      if (!recipe){
        return res.status(400).json({
          success: false,
          message: "Recipe missing. Recipe not saved. " + recipe
        })
      }
      console.log(req.body)
      recipe.User = uid // Assign User to recipe

      if (recipe.User && recipe.Name && recipe.Score && recipe.Ingredients){
        recipe.Servings = (Recipe.Servings == true) ? Recipe.Servings : 1
        recipe.Klimato = (Recipe.Klimato == true) ? Recipe.Klimato : false
        recipe.Archived = (Recipe.Archived == true ) ? Recipe.Archived : false
        recipe.Public = (Recipe.Servings == true) ? Recipe.Archived : false

        Recipe.create(recipe, function(err, recipe) {
          return res.status(200).json({
              success: true,
              message: 'Receptet ' + recipe.Name + " sparades!",
              id: recipe._id
          });
        })
      } else {
        console.log(err)
        return respondError(res, 400, 'Parameters missing. Recipe not saved. ' + recipe.User + recipe.Name + recipe.Score + recipe.Ingredients)
      }
    });
  } catch (err) {
    console.log(err)
    return respondError(res, 400, 'Något gick fel. Det gick inte att spara.', err)
  }
});

router.put('/:uid/recipes/:rid', function (req, res) {
  // Edits a recipe according to the new inserted recipe
  console.log('hit /api/users/recipes [POST]')

  try {
    var user = req.params.uid
    var recipeID = req.params.rid
    var editAttributes = req.body.edit
    console.log(editAttributes)
    /*
    setAttributes = {
      Name: recipe.Name,
      text: recipe.Name,
      Score: recipe.Score,
      CO2: recipe.CO2,
      Energy: recipe.Energy,
      Servings: recipe.Servings,
      Klimato: recipe.Klimato,
      Archived: recipe.Archived,
      Public: recipe.Public,
      Ingredients: recipe.Ingredients
    }
    */
    Recipe.updateOne(
      {
        _id: recipeID,
        User:user
      },
      {
        $set: editAttributes
      }, function (err){
        if (err){
          return respondError(res, 400, 'A recipe with the given id and user could not be found.', err)
        } else {
          res.status(200).send({success: true, message: 'Recipe updated successfully'})
        }
    })
  } catch (err) {
    return respondError(res, 400, 'Något gick fel. Det gick inte att ta bort receptet', err)
  }
})

router.delete('/:uid/recipes/:rid', function (req, res) {
  try {
    var user = req.params.uid
    var recipeID = req.params.rid
    Recipe.updateOne(
      {_id: recipeID, User:user},
      {
        $set: { Archived: true}
      }, function (err){
        if (err){
          return respondError(res, 400, 'A recipe with the given id and user could not be found.', err)
        } else {
          res.status(200).send({success: true, message: 'Recipe deleted successfully'})
        }
    })
  } catch (err) {
    return respondError(res, 400, 'Något gick fel. Det gick inte att ta bort receptet', err)
  }
})


/* Reports endpoints! */

/*
Reports are indexed by YYYY-MM. For example: 2018-07 for July 2018.
*/

// /api/users/id/reports [GET]
router.get('/:uid/reports/', function (req, res) {
    // get all monthly reports of a user
    try {
      console.log("hit  /api/users/id/reports [GET]")
      // Return all months for the user
      var uid = req.params.uid

      Report.find({'User': uid}, function (err, foundReports){
        var reports = [];

        foundReports.forEach(function(report){
          if (!report.Archived){
            reports.push(report);
          }
        });
        try {
          res.status(200).json({
              success: true,
              message: "",
              data: reports
          }).send();
        } catch (err) { // Catching Error: Can't remove headers after they are sent here.. Investigate.
          console.log('Caught ' + err)
        }

      })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});



// /api/users/id/months/id [GET]
router.get('/:uid/reports/:month', function (req, res) {
    /* get a monthly report of a user.  */
    try {
      // Return the specific monthly report for the specified user
      var uid = req.params.uid
      var month = req.params.month

      Report.find({"User": uid, 'Month': month}, function (err, report){
        // console.log(recipes)
        res.status(200).json({
            success: true,
            message: "",
            data: report
        }).send();
      })
    } catch (err) {
      return respondError(res, 400, 'Något gick fel. ', err)
    }
});

// /api/users/months [POST]
router.post('/:uid/months/:month', function (req, res) {
  /* create a monthly report of a user.  */
  console.log('hit /api/users/months/month [POST]')
  try {
    var uid = req.params.uid;
    var month = req.params.month;

    /* Checking for bad month id */
    if (month.length != 7 && month.split('-').length != 2){
      return res.status(400).json({
        success: false,
        message: "Montly id in wrong format. Not saved. " + month
      })
    }

    if (!req.body.report){
      return res.status(400).json({
        success: false,
        message: "Montly Report data missing. Not saved. " + report
      })
    }

    /* Accessing report from database */
    User.findOne({ _id: uid }, function(err, user) {
      if (!user){
        return res.status(400).json({success: false, message: 'Did not find user ' + uid })
      }

      var report = {}
      var settings = req.body.settings // Currently unused variable for sending meta data.

      /* Assign parameters */
      report.User = uid
      report.Month = month
      report.Compensated, report.Paid = false
      report.CompensationData, report.PaymentData = ""
      report.Recipes = []

      /* Summing up monthly data. This would be the place to sum up more data. */
      req.body.recipes.forEach(function(recipe){
        report.CO2 += (recipe.CO2 * recipe.Servings)
        report.Servings += recipe.Servings
        report.Recipes.push({
          id: recipe._id,
          Name: recipe.Name,
          Servings: recipe.Servings,
          CO2: recipe.CO2
        })
      });

      /* Checking for NaN/undefined in CO2 and Servings */
      if (!report.CO2 || !report.Servings){
        return res.status(400).json({
          success: false,
          message: "CO2 or Serving data missing in one or more recipes. "
        })
      }

      Report.create(recipe, function(err, report) {
        return res.status(200).json({
            success: true,
            message: 'The report for month ' + report.Month + " was saved!",
            id: report._id
        });
      })
    });
  } catch (err) {
    console.log(err)
    return respondError(res, 400, 'Något gick fel. Det gick inte att spara.', err)
  }
});

router.put('/:uid/reports/:month', function (req, res) {
  // Edits a monthly report
  console.log('hit /api/reports/month [PUT]')
  console.log('Not Implemented')


/*
  try {
    var user = req.params.uid
    var month = req.params.month
    var editAttributes = req.body.edit
    console.log(editAttributes)

    Report.updateOne(
      {
        _id: id,
        User:user
      },
      {
        $set: editAttributes
      }, function (err){
        if (err){
          return respondError(res, 400, 'A report with the given id and user could not be found.', err)
        } else {
          res.status(200).send({success: true, message: 'Recipe updated successfully'})
        }
    })
  } catch (err) {
    return respondError(res, 400, 'Something went wrong, could not update. ', err)
  }
*/
})

router.delete('/:uid/reports/:month', function (req, res) {
  try {
    var user = req.params.uid
    var month = req.params.month
    Report.deleteOne(
      {
        Month: month,
        User:user
      }, function (err){
        if (err){
          return respondError(res, 400, 'A report for the given month and user could not be found.', err)
        } else {
          res.status(200).send({success: true, message: 'Report deleted successfully'})
        }
    })
  } catch (err) {
    return respondError(res, 400, 'Something went wrong, could not delete recipe.', err)
  }
})


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

module.exports = router;
