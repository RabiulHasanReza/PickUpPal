const Pool = require('pg').Pool;

const pool = new Pool({
    user : "postgres",
    password : "Kmss_01666",
    host : "localhost",
    port : 5432,
    database : "pickuppal"
});

module.exports = pool;