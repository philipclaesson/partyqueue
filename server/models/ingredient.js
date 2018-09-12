// Version 2 of the Ingredient datamodel

// Exports a Mongoose model.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var IngredientSchema = new mongoose.Schema({
  FoodCat1ID:	Number,
  FoodCat1Name: String,
  FoodCat2ID: Number,
 FoodCat2Name: String,
   FoodCat3ID: Number,
 FoodCat3Name: String,
  SLVID: Number,
 Name: String,
  text: String,
   Energi: Number,
 Kolhydrater: Number, 
  Fett:	Number,
  Protein: Number, 
  Järn: Number, 
  Vitamin_D: Number, 
  Folat	: String, 
  Fibrer: Number,
  Primary: Boolean,
  Class: Number,
  OriginalName: String,
  WeightedAvgCO2: Number,
  DuplicateId: Number,
  Index: Number,
  Variations: [
    {
      CO2: Number,
      Organic: Boolean,
      ID: Number,
      RegionID: Number,
      RegionName: String,
      text: String,
      CO2EnergyDensity: Number
  }
  ]
});

var Ingredient = mongoose.model('Ingredient', IngredientSchema);

module.exports = Ingredient;