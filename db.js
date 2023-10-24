import dotenv from 'dotenv'
import postgres from 'postgres'
dotenv.config();

const pool = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPostgresVersion() {
  const response = await sql`select version()`;
  console.log(response);
}

getPostgresVersion();

export default pool
