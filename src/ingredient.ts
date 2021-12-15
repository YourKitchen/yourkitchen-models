import { composeMongoose } from 'graphql-compose-mongoose'
import { Schema, Document, model } from 'mongoose'

export interface Ingredient {
  _id: string
  count: number
  name: string
  unit?: string
  amount?: number
  allergenType: string
  type: string
  ownerId: string
}

export interface IIngredient extends Document, Ingredient {
  _id: string
}

export const IngredientSchema = new Schema(
  {
    count: Number,
    name: { type: String, required: true },
    unit: String,
    amount: Number,
    allergenType: { type: String, default: '' },
    type: String,
    ownerId: String,
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
)

export const IngredientModel = model<IIngredient>(
  'ingredients',
  IngredientSchema,
)
export const IngredientTC = composeMongoose<IIngredient>(IngredientModel)

export default IngredientModel
