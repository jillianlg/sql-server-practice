require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns All females in data', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Wonder Woman',
          evil_factor: 0,
          feature_film: true,
          publisher_id: 2,
          owner_id: 1,
        },
        {
          id: 2,
          name: 'Black Widow',
          evil_factor: 2,
          feature_film: true,
          publisher_id: 1,
          owner_id: 1,
        },
        {
          id: 3,
          name: 'Captin Marvel',
          evil_factor: 0,
          feature_film: true,
          publisher_id: 1,
          owner_id: 1,
        },
        {
          id: 4,
          name: 'Poison Ivy',
          evil_factor: 9,
          feature_film: false,
          publisher_id: 2,
          owner_id: 1,
        },
        {
          id: 5,
          name: 'Tank Girl',
          evil_factor: 2,
          feature_film: true,
          publisher_id: 3,
          owner_id: 1,
        },
        {
          id: 6,
          name: 'Mystique',
          evil_factor: 6,
          feature_film: false,
          publisher_id: 1,
          owner_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/females')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns one female by id from data', async() => {

      const expectation = 
        {
          id: 1,
          name: 'Wonder Woman',
          evil_factor: 0,
          feature_film: true,
          publisher_id: 2,
          owner_id: 1
        };

      const data = await fakeRequest(app)
        .get('/females/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // POST test
    test('adds new female data to end of array', async() => {

      const expectation = 
        {
          id: 7,
          name: 'Storm',
          evil_factor: 2,
          feature_film: false,
          publisher_id: 1,
          owner_id: 1,
        };

      const data = await fakeRequest(app)
        .post('/females')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      const allFemales = await fakeRequest(app)
        .get('/females')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allFemales.body.length).toEqual(7);
    });

    // PUT test
    test('update a single data item for one female in data', async() => {

      const expectation = 
        {
          id: 7,
          name: 'Storm',
          evil_factor: 2,
          feature_film: false,
          publisher_id: 1,
          owner_id: 1,
        };

      const data = await fakeRequest(app)
        .put('/females/7')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // DELETE test
    test.only('deletes one female from data and returns the remaining data array', async() => {

      const expectation = 
        {
          id: 7,
          name: 'Storm',
          evil_factor: 2,
          feature_film: false,
          publisher_id: 1,
          owner_id: 1,
        };

      const deletedData = await fakeRequest(app)
        .delete('/females/7')
        .expect('Content-Type', /json/)
        .expect(200);

      const allFemales = await fakeRequest(app)
        .get('/females')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deletedData.body).toEqual(expectation);
      expect(allFemales.body.length).toEqual(6);

      
    });

  });
// last set of }); are missing from bootstrap
});
