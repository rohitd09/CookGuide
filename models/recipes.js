const mongoose = require("mongoose")

const RecipeSchema = new mongoose.Schema({
    name: String,
    description: String,
    method: String,
    ingredients: String,
    type: {
        type: Array,
        default: []
    },
    image: String
})

module.exports = mongoose.model("Recipe", RecipeSchema)