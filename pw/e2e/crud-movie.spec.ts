import { test, expect } from '../support/fixtures'
import { generateMovie } from '../../cypress/support/factories'
import {
  getMovies,
  getMovieById,
  getMovieByName,
  updateMovie,
  deleteMovieById,
  addMovie,
} from '../../src/consumer'
import type {
  CreateMovieResponse,
  GetMovieResponse,
  UpdateMovieResponse,
  DeleteMovieResponse
} from '../../src/provider-schema/movie-types'

const apiUrl = `http://localhost:${process.env.SERVERPORT}`

test.describe('CRUD movie', () => {
  const movie = generateMovie()
  const updatedMovie = { name: 'Updated Name', year: 2000 }
  const movieProps = {
    name: expect.any(String),
    year: expect.any(Number),
    director: expect.any(String),
    rating: expect.any(Number)
  }

  test.beforeAll(async ({ apiRequest }) => {
    const response = await apiRequest<{ message: string }>({
      method: 'GET',
      url: '/'
    })
    expect(response.body.message).toBe('Server is running')
  })

  test('should crud', async () => {
    // Add a movie
    const { status: addMovieStatus, data: addMovieData } = (await addMovie(
      apiUrl,
      movie
    )) as CreateMovieResponse
    expect(addMovieStatus).toBe(200)
    expect(addMovieData).toMatchObject(movieProps)

    const movieId = addMovieData.id

    // Get all movies and verify that the new movie exists
    const { status: getAllStatus, data: getAllData } = (await getMovies(
      apiUrl
    )) as GetMovieResponse

    expect(getAllStatus).toBe(200)
    expect(getAllData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: movieId
        })
      ])
    )

    // Get movie by ID
    const { status: getByIdStatus, data: getByIdData } = (await getMovieById(
      apiUrl,
      movieId
    )) as GetMovieResponse
    expect(getByIdStatus).toBe(200)
    expect(getByIdData).toEqual(expect.objectContaining({ id: movieId }))

    // Get movie by name
    const { status: getByNameStatus, data: getByNameData } =
      (await getMovieByName(apiUrl, movie.name)) as GetMovieResponse
    expect(getByNameStatus).toBe(200)
    expect(getByNameData).toEqual(
      expect.objectContaining({ name: movieProps.name })
    )

    // Update movie
    const {status: updateMovieStatus, data: updateMovieData} = await updateMovie(apiUrl, movieId, updatedMovie) as UpdateMovieResponse
    expect(updateMovieStatus).toBe(200)
    expect(updateMovieData).toMatchObject({id: movieId, ...updatedMovie})

    // Delete movie by ID
    const { status: deleteMovieStatus, message: deleteMovieMessage } = await deleteMovieById(apiUrl, movieId) as DeleteMovieResponse
    expect(deleteMovieStatus).toBe(200)
    expect(deleteMovieMessage).toContain(movieId.toString())

  })
})
