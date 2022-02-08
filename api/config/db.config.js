const mysql = require('mysql');
/** Connection pool creation - START */
connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'eva_exchange_demo'
});
/** Connection pool creation - END */
module.exports = connection;