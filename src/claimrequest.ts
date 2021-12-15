import { Schema, model, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserModel } from './user'
import { Recipe, RecipeModel, User } from '.'

export interface ClaimRequest {
  _id: string
  recipeId: string
  message: string
  ownerId: string
  recipe?: Recipe
  owner: User
}

export interface IClaimRequest extends Document, ClaimRequest {
  _id: string
}

export const ClaimRequestSchema = new Schema({
  recipeId: { type: String, required: true },
  message: String,
  ownerId: String,
})
export const ClaimRequestModel = model<IClaimRequest>(
  'claimrequests',
  ClaimRequestSchema,
)
export const ClaimRequestTC = composeMongoose<IClaimRequest>(ClaimRequestModel)

ClaimRequestTC.addRelation('recipe', {
  type: 'recipes!',
  resolve: async (source) => {
    return await RecipeModel.findOne({ _id: { $eq: source.recipeId } })
  },
  projection: { recipeId: 1 },
})

ClaimRequestTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  ClaimRequestModel,
  ClaimRequestSchema,
  ClaimRequestTC,
}
