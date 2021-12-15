export type SearchType = 'recipe' | 'ingredient' | 'user'

export type SearchResult = {
  _id: string
  name: string
  type: SearchType
  image?: string
}
