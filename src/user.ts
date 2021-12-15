import { composeMongoose } from 'graphql-compose-mongoose'
import { model, Document, Schema } from 'mongoose'
import { Rating, RatingModel, RecipeModel } from '.'
// import {RecipeModel} from './recipe'
// import {Rating, RatingModel} from './rating'

export interface User {
  ID: string
  allergenes: string[]
  defaultPersons: number
  name?: string
  email: string
  following: string[]
  followers?: string[]
  tokens?: string[]
  image?: string
  score?: number
  timezone?: number
  privacySettings: { [key: string]: string | number | boolean }
  notificationSettings: { [key: string]: string | number | boolean }
  social: {
    facebook?: string
    google?: string
    apple?: string
  }
  role?: string
}

export interface IUser extends Document, User {}

export const UserSchema: Schema = new Schema(
  {
    ID: { type: String, required: true },
    allergenes: { type: [String], default: [] },
    defaultPersons: { type: Number, default: 4 },
    name: String,
    email: { type: String, required: true },
    following: { type: [String], default: [] },
    tokens: { type: [String], default: [] },
    image: String,
    privacySettings: {
      mealplan: { type: String, default: 'everyone' },
      adConsent: { type: Boolean, default: false },
      consent: { type: Boolean, default: false },
    },
    notificationSettings: {
      mealplanFrequency: { type: String, default: 'weekly' },
    },
    timezone: Number,
    social: {
      facebook: String,
      google: String,
      apple: String,
    },
    role: String,
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
)

export const UserModel = model<IUser>('users', UserSchema)
export const UserTC = composeMongoose<IUser>(UserModel)

UserTC.addRelation('followers', {
  type: '[String!]!',
  resolve: async (source) => {
    return (await UserModel.find({ following: source.ID })).map((val) => val.ID)
  },
  projection: { ID: 1 },
})

UserTC.addRelation('score', {
  type: 'Float',
  resolve: async (source) => {
    try {
      const ownRecipes = await RecipeModel.find({
        ownerId: { $eq: source.ID },
      })
      const recipeIDs = ownRecipes.map((recipe) => recipe._id as string)
      // Get all ratings in the recipe array
      const ratings: Rating[] = await RatingModel.find({
        recipeId: { $in: recipeIDs },
      })
      const ratingValue = ratings
        .map((rating) => rating.value)
        .reduce((prev, cur) => prev + cur, 0 as number)
      return ratingValue
    } catch (err) {
      console.error(err)
      return -1
    }
  },
  projection: { ID: 1 },
})

export default {
  UserModel,
  UserSchema,
  UserTC,
}
