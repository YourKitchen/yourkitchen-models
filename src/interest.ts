import { model, Schema, Document } from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserModel } from './user'

export interface Interest {
  _id: string
  ownerId: string
  likes: { [key: string]: number }
  ratings: { [key: string]: number }
}

export interface IInterest extends Interest, Document {
  _id: string
}

export const InterestSchema = new Schema({
  ownerId: String,
  likes: { type: Object, default: [] },
  ratings: { type: Object, default: [] },
})

export const InterestModel = model<IInterest>('interests', InterestSchema)
export const InterestTC = composeMongoose<IInterest>(InterestModel)

InterestTC.addRelation('owner', {
  type: 'type User { name : String, ID : String, image : String }',
  resolve: async (source) => {
    return await UserModel.findOne({ ID: { $eq: source.ownerId } })
  },
  projection: { ownerId: 1 },
})

export default {
  InterestModel,
  InterestSchema,
  InterestTC,
}
