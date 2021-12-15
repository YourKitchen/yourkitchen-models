import { model, Schema, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { Ingredient, IngredientSchema } from './ingredient'
import { User, UserModel } from './user'

export interface Kitchen {
  _id: string
  refrigerator: Ingredient[]
  shoppinglist: Ingredient[]
  shared: User[]
  owner: User
  ownerId: string
}

export interface IKitchen extends Document, Kitchen {
  _id: string
}

export const KitchenSchema = new Schema({
  ownerId: String,
  refrigerator: [IngredientSchema],
  shoppinglist: [IngredientSchema],
  shared: [String],
})

export const KitchenModel = model<IKitchen>('kitchens', KitchenSchema)
export const KitchenTC = composeMongoose<IKitchen>(KitchenModel)

KitchenTC.addRelation('shared', {
  type: '[users!]!',
  resolve: async (source) => {
    return await UserModel.find({ ID: { $in: source.shared } })
  },
  projection: { shared: 1 },
})

KitchenTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  KitchenModel,
  KitchenSchema,
  KitchenTC,
}
