const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../../schemas/user');
const { Rental } = require('../../../schemas/rental');
const { Movie } = require('../../../schemas/movie');
const moment = require('moment');

let server;

describe('/api/returns', () => {
  let customerId;
  let movieId;
  let rental;
  let token;
  let payload;
  let movie;

  beforeEach(() => {
    server = require('../../../app');
  });

  afterEach(async () => {
    await Rental.remove({});
    await Movie.remove({});
    await server.close();
  });

  beforeEach(async () => {
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    payload = {
      customerId,
      movieId
    };

    movie = new Movie({
      _id: movieId,
      title: 'test1',
      dailyRentalRate: 2,
      numberInStock: 10,
      genre: { name: 'testing' }
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'test1',
        phone: '0123456789'
      },
      movie: {
        _id: movieId,
        title: 'test1',
        dailyRentalRate: 2
      }
    });

    await rental.save();
  });

  const exec = () => {
    return request(server)
      .post('/api/returns/')
      .set('x-auth-token', token)
      .send(payload);
  };

  it('Return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it('Return 400 if custumerId is not provided', async () => {
    delete payload.customerId;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('Return 400 if movieId is not provided', async () => {
    delete payload.movieId;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('Return 404 if not rental found for this customer and movie', async () => {
    await Rental.remove({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('Return 400 if return is already process', async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('Return 200 if valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('calculate the rental fee', async () => {
    rental.dateOut = moment()
      .add(-7, 'days')
      .toDate();
    await rental.save();
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('increase the movie stock', async () => {
    const res = await exec();
    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('return rental object', async () => {
    const res = await exec();
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'customer',
        'movie',
        'dateOut',
        'dateReturned',
        'rentalFee'
      ])
    );
  });
});
