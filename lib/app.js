const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/publishers', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT * FROM publishers;
    `);

    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// new GET all w/ publishers table join
app.get('/females', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT females.id, females.name, females.evil_factor, females.feature_film, females.publisher_id, females.owner_id
    FROM females
    JOIN publishers
    ON publishers.id = females.publisher_id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// order by publishers.id desc
// old GET all
// app.get('/females', async(req, res) => {
//   try {
//     const data = await client.query('SELECT * from females');
    
//     res.json(data.rows);
//   } catch(e) {
    
//     res.status(500).json({ error: e.message });
//   }
// });

// new GET one by id
app.get('/females/:id', async(req, res) => {
  try {
    const femaleId = req.params.id;

    const data = await client.query(`
    SELECT females.id, females.name, females.evil_factor, females.feature_film, females.publisher_id, females.owner_id
    FROM females
    JOIN publishers
    ON publishers.id = females.publisher_id
    WHERE females.id=$1`,
    [femaleId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// old GET one by id
// app.get('/females/:id', async(req, res) => {
//   try {
//     const femaleId = req.params.id;

//     const data = await client.query(`
//         SELECT * from females
//         WHERE females.id=$1`, 
//     [femaleId]);
    
//     res.json(data.rows[0]);
//   } catch(e) {
    
//     res.status(500).json({ error: e.message });
//   }
// });

// Add POST
app.post('/females/', async(req, res) => {
  try {
    const newName = req.body.name;
    const newEvil = req.body.evil_factor;
    const newFilm = req.body.feature_film;
    const newPublisher = req.body.publisher_id;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    INSERT INTO females (name, evil_factor, feature_film, publisher_id, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [newName, newEvil, newFilm, newPublisher, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Add PUT
app.put('/females/:id', async(req, res) => {
  try {
    const newName = req.body.name;
    const newEvil = req.body.evil_factor;
    const newFilm = req.body.feature_film;
    const newPublisher = req.body.publisher_id;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    UPDATE females
    SET name = $1,
    evil_factor = $2,
    feature_film = $3,
    publisher_id = $4,
    owner_id = $5
    WHERE females.id = $6
    RETURNING *
    `,
    [newName, newEvil, newFilm, newPublisher, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Add DELETE
app.delete('/females/:id', async(req, res) => {
  try {
    const femaleId = req.params.id;

    const data = await client.query(`
        DELETE FROM females
        WHERE females.id=$1
        RETURNING *`, 
    [femaleId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
