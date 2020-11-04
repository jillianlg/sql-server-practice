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

    test('returns females', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Wonder Woman',
          evil_factor: 0,
          feature_film: true,
          publisher: 'DC Comics',
          owner_id: 1,
        },
        {
          id: 2,
          name: 'Black Widow',
          evil_factor: 2,
          feature_film: true,
          publisher: 'Marvel',
          owner_id: 1,
        },
        {
          id: 3,
          name: 'Captin Marvel',
          evil_factor: 0,
          feature_film: true,
          publisher: 'Marvel',
          owner_id: 1,
        },
        {
          id: 4,
          name: 'Poison Ivy',
          evil_factor: 9,
          feature_film: false,
          publisher: 'DC Comics',
          owner_id: 1,
        },
        {
          id: 5,
          name: 'Tank Girl',
          evil_factor: 2,
          feature_film: true,
          publisher: 'Dark Horse',
          owner_id: 1,
        },
        {
          id: 6,
          name: 'Mystique',
          evil_factor: 6,
          feature_film: false,
          publisher: 'Marvel',
          owner_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/females')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single female', async() => {

      const expectation = 
        {
          id: 1,
          name: 'Wonder Woman',
          evil_factor: 0,
          feature_film: true,
          publisher: 'DC Comics',
          owner_id: 1,
        };

      const data = await fakeRequest(app)
        .get('/females/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('add new female', async() => {

      const expectation = 
        {
          id: 7,
          name: 'Storm',
          evil_factor: 2,
          feature_film: false,
          publisher: 'MArvel',
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
  });
// last set of }); are missing from bootstrap
});
