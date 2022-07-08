require('dotenv').config();
const { Pool } = require('pg')

const devConfig = {
    user: process.env.LOCAL_DB_USER,
    database: process.env.LOCAL_DB,
    password: process.env.LOCAL_DB_PASSWORD,
    port: process.env.LOCAL_PORT,
    host: process.env.LOCAL_HOST,
};

// const deployConfig = {
//     user: process.env.DEPLOY_DB_USER,
//     database: process.env.DEPLOY_DB,
//     password: process.env.DEPLOY_DB_PASSWORD,
//     port: process.env.DEPLOY_PORT,
//     host: process.env.DEPLOY_HOST,
// };

// const config = process.env.PRODUCTION ? deployConfig : devConfig;

const pool = new Pool(devConfig)

module.exports = pool;