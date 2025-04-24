// these are a copy of the types at the provider/producer
// in the real world, they would be published as packages and installed here at the consumer

export type MovieAction = 'created' | 'updated' | 'deleted'
type Event<T extends string> = {
  topic: `movie-${T}`
  director: string
  year: number
  id: number
  name: string
  rating: number
}
export type MovieEvent = Event<MovieAction>
