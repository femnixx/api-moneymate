const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user:process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pemweb'
};

const conPool = mysql.createPool(dbConfig);

// test the connection
conPool.getConnection().then(connection => {
    console.log("Connected successfully.");
    connection.release();
}).catch(err => {
    console.log("Failed to connect with cerror: ", err.message);
    process.exit(1);
})

module.exports = conPool; // to export to other files
