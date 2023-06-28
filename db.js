import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config();

const {Pool} = pg
const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: 'todoapp'
})


export default pool