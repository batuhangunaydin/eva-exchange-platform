const connection = require("../config/db.config");

exports.getAllRegisteredShares = (callback) => {
  if (connection) {
    var sqlCommand = "SELECT * FROM registeredshares";
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

exports.createRecord = (share, callback) => {
    if (connection) {
      var sqlCommand = "INSERT INTO registeredshares (traderId, ShareName, ShareCode, RegisteredAmount, SharePrice, TradeSide) VALUES (?,?,?,?,?,?)";
      connection.query(sqlCommand, [share.traderId, share.shareName, share.shareCode, share.registeredAmount, share.sharePrice, share.tradeSide],
        (err, result) => {
          if (err) {
            callback(false, 0);
          }
          else {
            callback(true, result.insertId);
          }
        }
      )
    }
    else{
      callback(false, 0);
    }
};

exports.deleteRecord = (id, callback) => {
  if (connection){
    var sqlCommand = "DELETE FROM registeredshares WHERE Id = ?";
    connection.query(sqlCommand, id,
      (err) => {
        if (err) {
          callback(false);
        }
        else {
          callback(true);
        }
      }
    )
  }
  else{
    callback(false);
  }

};

exports.checkRegisteredShare = (id, traderId, shareCode) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT * FROM registeredshares WHERE Id = ? AND traderId = ? AND ShareCode = ?";
      connection.query(sqlCommand, [id, traderId, shareCode],
        (err, rows) => {
          if (err) {
            reject(null);
          }
          else {
            if(rows.length <= 0){
              resolve(null);
            }else {
              resolve(rows[0]);
            }
          }
        }
      )
    }
    else {
      reject(null);
    }
  });
};

exports.getRegisteredShare = (id) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT * FROM registeredshares WHERE Id = ?";
      connection.query(sqlCommand, id,
        (err, rows) => {
          if (err) {
            reject(null);
          }
          else {
            if(rows.length <= 0){
              resolve(null);
            }else {
              resolve(rows[0]);
            }
          }
        }
      )
    }
    else {
      reject(null);
    }
  });
};

exports.getRegisteredShareAmount = (id) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT RegisteredAmount FROM registeredshares WHERE Id = ?";
      connection.query(sqlCommand, id,
        (err, rows) => {
          if (err) {
            reject(null);
          }
          else {
            if(rows.length <= 0){
              resolve(null);
            }else {
              resolve(rows[0].RegisteredAmount);
            }
          }
        }
      )
    }
    else {
      reject(null);
    }
  });
};

exports.updatePriceAndDate = async(id, price, updateDate, callback) => {
  if (connection) {
    var sqlCommand = "UPDATE registeredshares SET SharePrice = ?, LastUpdateDate = ? WHERE Id = ?";
    connection.query(sqlCommand, [price, updateDate,id],
      (err) => {
        if (err) {
          callback(false);
        }
        else {
          callback(true);
        }
      }
    )
  }
  else {
    callback(false);
  }
};

exports.updateRegisteredShareAmount = async(id, amount, callback) => {
  if(connection){
    const shareAmount = await this.getRegisteredShareAmount(id);
    const newAmount = shareAmount - amount;
    
    var sqlCommand = "UPDATE registeredshares SET RegisteredAmount = ? WHERE Id = ?";

    connection.query(sqlCommand, [newAmount, id],
      (err) => {
        if (err) {
          callback(false);
        }
        else {
          callback(true);
        }
      }
    )
  }
  else {
    callback(false);
  }
}