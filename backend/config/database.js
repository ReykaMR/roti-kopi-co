const mysql = require("mysql2");
require("dotenv").config();

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("Database environment variables are not properly set");
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const promisePool = pool.promise();

promisePool
  .getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database as id " + connection.threadId);
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed: " + err.stack);
    process.exit(1);
  });

pool.on("error", (err) => {
  console.error("Database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed.");
  } else {
    throw err;
  }
});

module.exports = promisePool;
