import express, {Express, Request, Response, response} from 'express'
import dotenv from 'dotenv'
import mysql, {Connection} from 'mysql'
import cors from 'cors'
import bodyParser from 'body-parser'

dotenv.config();

const db: Connection = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
})

const app: Express = express()
const port = process.env.PORT
app.use(cors())
app.use(bodyParser.json())

app.post('/login', (req, res) => {
    const { login, password } = req.body.body;
    const query = `SELECT * FROM users WHERE username = '${login}' AND password = '${password}'`;
    db.query(query, (err, result) => {
      if (result) {
        res.status(200);
      }
    });
  });

app.listen(port, ()=>{
    console.log(`Server is up! at http//localhost:${port}`)
})