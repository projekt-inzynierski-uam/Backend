import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config();

const {Pool} = pg

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DBPORT} = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: DBPORT,
});


export default pool