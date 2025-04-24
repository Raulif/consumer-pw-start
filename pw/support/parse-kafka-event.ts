// all Kafka events are logged to a file, so we can somewhat verify them
// in the real world, you might check db, other services, or any other external side effects
import { promises as fs } from 'fs'
import type { MovieEvent, MovieAction } from '../../src/events/movie-event-types'
import { logFilePath } from '../../src/events/log-file-path'

/**
 * Curried filter function to filter by topic and movieId
 *
 * @param {number} movieId - The ID of the movie to filter by.
 * @param {string} topic - The Kafka topic to filter by.
 * @param {Array<MovieEvent>} entries
 * @returns {Array<MovieEvent>} - A function that filters entries based on the topic and movieId.
 */
const filterByTopicAndId = (
  movieId: number,
  topic: `movie-${MovieAction}`,
  entries: MovieEvent[]
) =>
  entries.filter(
    (entry: MovieEvent) => entry.topic === topic && entry.id === movieId
  )

/**
 * Parses the Kafka event log file and filters events based on the topic and movieId.
 *
 * @param {number} movieId - The ID of the movie to filter for.
 * @param {`movie-${MovieAction}`} topic - The Kafka topic to filter by.
 * @param {string} [filePath=logFilePath] - Optional file path for the Kafka event log file.
 * @returns {Promise<MovieEvent[]>} - A promise that resolves the matching events
 */
export const parseKafkaEvent = async (
  movieId: number,
  topic: `movie-${MovieAction}`,
  filePath = logFilePath
) => {
  try {
    // Read and process the Kafka log file
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const entries = fileContent
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as MovieEvent)

    // Fitler the entries by topic and movieId
    return filterByTopicAndId(movieId, topic, entries)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error parsing Kafka event log: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    throw error
  }
}
