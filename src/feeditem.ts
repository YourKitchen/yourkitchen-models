/* eslint-disable camelcase */
import { composeMongoose } from 'graphql-compose-mongoose'
import { Schema, Document, model } from 'mongoose'
import { RatingModel } from '.'
import { Recipe, RecipeModel, RecipeTC } from './recipe'
import { User, UserModel } from './user'

export interface FeedItem {
  _id: string
  ownerId: string
  description: string
  recipeId: string
  rating?: number
  recipe?: Recipe
  owner?: User
  created_at: Date
  updated_at: Date
}

export interface IFeedItem extends Document, FeedItem {
  _id: string
}

export const FeedItemSchema: Schema = new Schema(
  {
    ownerId: String,
    description: { type: String, default: '' },
    recipeId: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export const FeedItemModel = model<IFeedItem>('feeditems', FeedItemSchema)
export const FeedItemTC = composeMongoose<IFeedItem>(FeedItemModel)

FeedItemTC.addRelation('recipe', {
  type: RecipeTC,
  resolve: async (source) => {
    return await RecipeModel.findOne({ _id: source.recipeId })
  },
  projection: { recipeId: 1 },
})

FeedItemTC.addRelation('rating', {
  type: 'Float',
  resolve: async (source, _args, context) => {
    if (!context.user) {
      return false
    }
    const rating = await RatingModel.findOne({
      recipeId: source.recipeId,
      ownerId: context.user._id,
    })

    // If a rating exists it is becuse the user liked it
    if (rating) {
      return rating.value
    } else {
      return false
    }
  },
  projection: { recipeId: 1 },
})

FeedItemTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  FeedItemModel,
  FeedItemSchema,
  FeedItemTC,
}
