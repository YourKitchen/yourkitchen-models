import { Schema, model, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { Recipe, RecipeModel } from './recipe'
import { UserModel } from './user'

export type MealType = 'breakfast' | 'lunch' | 'dinner'
const MealTypes: string[] = ['breakfast', 'lunch', 'dinner']

export interface MealPlan {
  _id: string
  meals: { recipes: { [key: string]: Recipe[] }; date: Date }[]
  ownerId: string
}

export interface IMealPlan extends Document, MealPlan {
  _id: string
}

export const MealPlanSchema = new Schema({
  meals: [
    {
      recipes: Object,
      date: Date,
    },
  ],
  ownerId: String,
})
export const MealPlanModel = model<IMealPlan>('mealplans', MealPlanSchema)
export const MealPlanTC = composeMongoose<IMealPlan>(MealPlanModel)

MealPlanTC.addRelation('meals', {
  type: '[mealplansMeals]!',
  resolve: async (source) => {
    // Get all recipes ids
    const meals: MealPlan['meals'] = source.meals
    const recipesIds = meals
      .reduce<Recipe[]>(
        (prevRecipes, meal) =>
          prevRecipes.concat(
            MealTypes.reduce<Recipe[]>((prev, cur) => {
              return meal.recipes[cur] && meal.recipes[cur].length !== 0
                ? prev.concat(meal.recipes[cur])
                : prev
            }, []),
          ),
        [],
      )
      .map((recipe) => recipe._id as string)
    // Get all recipes
    const recipes = await RecipeModel.find({
      _id: {
        $in: recipesIds,
      },
    })
    return source.meals.map((meal) => {
      const tmpRecipes: MealPlan['meals'][0]['recipes'] = {}
      Object.keys(meal.recipes).forEach((key) => {
        tmpRecipes[key] = meal.recipes[key]
          .map((oldRecipe) =>
            recipes.find((recipe) => {
              return `${recipe._id}` === `${oldRecipe._id}`
            }),
          )
          .filter((recipe) => recipe !== undefined) as Recipe[]
      })
      return { date: meal.date, recipes: tmpRecipes }
    })
  },
  projection: {
    meals: 1,
  },
})

MealPlanTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  MealPlanModel,
  MealPlanSchema,
  MealPlanTC,
}
