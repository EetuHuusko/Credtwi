const { ChildProcess } = require('child_process');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg')
const emitter = require('events').EventEmitter
const cors = require('cors')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(cors())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/privacy_policy', (req,res) => res.render('pages/privacy_policy'))
  .get('/quest', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT quest_boolean FROM quest');
      const results = { 'results': (result) ? result.rows : null};
      res.set({'Acces-Control-Allow-Origin': 'https://afternoon-brook-01612.herokuapp.com/',
        'Origin': 'https://afternoon-brook-01612.herokuapp.com/',
        'Content-Type': 'application/json'});
      res.status(200).send(JSON.stringify(results));
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/trends', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT trend FROM trends');
      const results = { 'results': (result) ? result.rows : null};
      res.set({'Acces-Control-Allow-Origin': 'https://afternoon-brook-01612.herokuapp.com/',
        'Origin': 'https://afternoon-brook-01612.herokuapp.com/',
        'Content-Type': 'application/json'});
      res.status(200).send(JSON.stringify(results));
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM credibility');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/db', async (req, res) => {
    try {
      const values = [];
      const query = {
        text: 'INSERT INTO credibility (uid, tweet_url, open_answer, score, time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        values: [req.body.uid, req.body.tweet_url, req.body.open_answer, req.body.score, req.body.time]
      };
      const client = await pool.connect();
      const result = await client.query(query);
      res.sendStatus(201);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))