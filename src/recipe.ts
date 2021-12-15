/* eslint-disable camelcase */
import { Schema, model, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { IRating, RatingModel } from './rating'
import { UserModel, User } from './user'
import { Ingredient, IngredientSchema } from './ingredient'

export interface Recipe {
  _id: string
  name: string
  description: string
  cuisine: string
  recipeType: string
  mealType: string
  preparationTime: {
    hours: number
    minutes: number
  }
  image: string
  ingredients: Ingredient[]
  steps: string[]
  rating: number
  persons: number
  ownerId: string
  preference?: string
  owner?: User
  created_at: Date
  updated_at: Date
}

export interface IRecipe extends Document, Recipe {
  _id: string
}

export const RecipeSchema: Schema = new Schema(
  {
    name: String,
    description: String,
    cuisine: String,
    recipeType: String,
    mealType: String,
    preparationTime: {
      hours: Number,
      minutes: Number,
    },
    image: String,
    ingredients: [IngredientSchema],
    steps: [String],
    persons: { type: Number, default: 4 },
    ownerId: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)
export const RecipeModel = model<IRecipe>('recipes', RecipeSchema)
export const RecipeTC = composeMongoose<IRecipe>(RecipeModel)

RecipeTC.addFields({
  rating: {
    type: 'Float',
    resolve: async (source) => {
      const ratings: IRating[] =
        ((await RatingModel.find({
          recipeId: { $eq: source._id },
          messageId: undefined, // null because then it does not fetch comment ratings
        })) as IRating[]) || []
      if (ratings.length > 0) {
        return (
          Math.round(
            (ratings.reduce((prev, cur) => (prev += cur.value), 0) /
              ratings.length) *
              10.0,
          ) / 10.0
        )
      }
      return 0
    },
    projection: { _id: 1 },
  },
  preference: {
    type: 'String',
    projection: { ingredients: 1 },
    resolve: (source) => {
      const veganTypes = [
        'vegetables',
        'cereals',
        'fruits',
        'powders',
        'nuts',
        'oils',
        'spices',
        'other',
      ]
      const vegetarianTypes = [...veganTypes, 'eggs', 'dairy']
      if (
        source.ingredients.filter((ingredient) =>
          veganTypes.includes(ingredient.type),
        )
      ) {
        return 'vegan'
      } else if (
        source.ingredients.filter((ingredient) =>
          vegetarianTypes.includes(ingredient.type),
        )
      ) {
        return 'vegetarian'
      }
      return 'none'
    },
  },
  owner: {
    type: 'type User { name : String, ID : String, image : String }',
    projection: { ownerId: 1 },
    resolve: async (source) => {
      return await UserModel.findOne({ ID: { $eq: source.ownerId } })
    },
  },
})

export default RecipeModel
