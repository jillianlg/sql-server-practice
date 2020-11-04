const client = require('../lib/client');
// import our seed data:
const females = require('./female-characters.js');
const { publishers } = require('./publishers.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      females.map(females => {
        return client.query(`
                    INSERT INTO females (name, evil_factor, feature_film, publisher_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [females.name, females.evil_factor, females.feature_film, females.publisher_id, user.id]);
      })
    );
    
    await Promise.all(
      publishers.map(item => {
        return client.query(`
                      INSERT INTO publishers (publisher)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [item.publisher]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
