import { Schema, model, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserModel } from './user'
import { RecipeModel } from './recipe'
import { User } from '.'

export interface Rating {
  _id: string
  recipeId?: string
  messageId?: string

  value: number
  message?: string
  owner?: User
  ownerId: string
  createdAt: Date
}

export interface IRating extends Document, Rating {
  _id: string
}

export const RatingSchema = new Schema(
  {
    recipeId: String,
    messageId: String,

    value: { type: Number, index: true },
    message: String,
    ownerId: String,
  },
  { timestamps: { createdAt: 'createdAt' } },
)
export const RatingModel = model<IRating>('ratings', RatingSchema)
export const RatingTC = composeMongoose<IRating>(RatingModel)

RatingTC.addRelation('recipe', {
  type: 'recipes!',
  resolve: async (source) => {
    return await RecipeModel.findOne({ _id: { $eq: source.recipeId } })
  },
  projection: { recipeId: 1 },
})

RatingTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  RatingModel,
  RatingSchema,
  RatingTC,
}
