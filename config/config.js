import 'dotenv/config'

export default {
  "development": {
    "username":  process.env.LOCAL_PSQL_USER,
    "password": process.env.LOCAL_PSQL_PASS,
    "database": process.env.LOCAL_PSQL_DB,
    "host": process.env.LOCAL_PSQL_HOST,
    "dialect": "postgres"
  },
  "test": {
    "username":  process.env.LOCAL_PSQL_USER,
    "password": process.env.LOCAL_PSQL_PASS,
    "database": process.env.LOCAL_PSQL_DB,
    "host": process.env.LOCAL_PSQL_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username":  process.env.LOCAL_PSQL_USER,
    "password": process.env.LOCAL_PSQL_PASS,
    "database": process.env.LOCAL_PSQL_DB,
    "host": process.env.LOCAL_PSQL_HOST,
    "dialect": "postgres"
  }
}
