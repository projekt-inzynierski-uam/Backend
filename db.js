import pg from 'pg'
const {Pool} = pg
import dotenv from 'dotenv'
dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DBPORT} = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: DBPORT,
  ssl: {
    require: false,
  },
});


export default pool