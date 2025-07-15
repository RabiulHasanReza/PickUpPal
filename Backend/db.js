// require('dotenv').config();
// console.log("ENV loaded:", {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME
// });

// const { Pool } = require('pg');
// const pool = new Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
//   database: process.env.DB_NAME,
// });


// module.exports = pool;

const Pool = require('pg').Pool;

const pool = new Pool({
    user : "postgres",
    password : "Kmss_01666",
    host : "localhost",
    port : 5432,
    database : "pickuppal"
});

module.exports = pool;