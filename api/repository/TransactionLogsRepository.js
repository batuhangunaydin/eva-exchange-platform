const connection = require("../config/db.config");

exports.getAllLogs = (callback) => {
  if (connection) {
    var sqlCommand = "SELECT * FROM transactionLogs";
    connection.query(sqlCommand,
      (err, rows) => {
        if (err) {
          callback(null, constants.noDataError);
        }
        else {
          callback(null, rows);
        }
      }
    )
  }
  else {
    callback(null, constants.databaseError);
  }
};

exports.createRecord = (log, callback) => {
  if (connection) {
    var sqlCommand = "INSERT INTO transactionlogs (traderId, ShareCode, ShareAmount, SharePrice, TradeSide, Status) VALUES (?,?,?,?,?,?)";
    connection.query(sqlCommand, [log.traderId, log.shareCode, log.shareAmount, log.sharePrice, log.tradeSide, log.status]);
  }
};