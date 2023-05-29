import express, {Express, Request, Response, response} from 'express'
import dotenv from 'dotenv'
import mysql, {Connection} from 'mysql'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ok } from 'assert'

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
    const { login, password } = req.body;
  
    // Query the database for login and password match
    const query = `SELECT * FROM users WHERE login = '${login}' AND password = '${password}'`;
    db.query(query, (err, result) => {
      if (result.length > 0) {
        res.send(200)
      }
    });
  });

app.listen(port, ()=>{
    console.log(`Server is up! at http//localhost:${port}`)
})