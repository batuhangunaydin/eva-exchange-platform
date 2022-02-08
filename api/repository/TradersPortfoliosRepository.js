const connection = require("../config/db.config");

exports.getAllPortfolios = (callback) => {
  if (connection) {
    var sqlCommand = "SELECT * FROM tradersportfolios";
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

exports.checkTraderPortfolio = (traderId, shareCode) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT Id FROM tradersportfolios WHERE traderId = ? AND ShareCode = ?";
      connection.query(sqlCommand, [traderId, shareCode],
        (err, rows) => {
          if (err) {
            reject(false);
          }
          else {
            if(rows.length <= 0){
              resolve(false);
            }else {
              resolve(true);
            }
          }
        }
      )
    }
    else {
      reject(false);
    }
  });
};

exports.getPortfiliosShareAmount = async(traderId, shareCode) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT ShareAmount FROM tradersportfolios WHERE traderId = ? AND ShareCode = ?";
      connection.query(sqlCommand, [traderId, shareCode],
        (err, rows) => {
          if (err) {
            reject(0);
          }
          else {
            if(rows.length <= 0){
              resolve(0);
            } 
            else {
              resolve(rows[0].ShareAmount);
            }
          }
        }
      )
    }
    else{
      reject(false);
    }
  });
};

exports.getPortfiliosShareAmounts = async(traderId, shareCode) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT Id, ShareAmount, ShareBlockedAmount FROM tradersportfolios WHERE traderId = ? AND ShareCode = ?";
      connection.query(sqlCommand, [traderId, shareCode],
        (err, rows) => {
          if (err) {
            reject(0);
          }
          else {
            if(rows.length <= 0){
              resolve(0);
            } 
            else {
              resolve(rows[0]);
            }
          }
        }
      )
    }
    else {
      reject(0);
    }
  });
};

exports.updateTradersPortfolioForRegisterShare = async(traderId, shareCode, amount, callback) => {
  if (connection) {
    const amountResult = await this.getPortfiliosShareAmounts(traderId, shareCode);
    const newAmount = Number(amountResult.ShareAmount) - Number(amount);
    const newBlockedAmount = Number(amountResult.ShareBlockedAmount) + Number(amount);

    var sqlCommand = "UPDATE tradersportfolios SET ShareAmount = ?, ShareBlockedAmount = ? WHERE Id = ?";
    connection.query(sqlCommand, [newAmount, newBlockedAmount, amountResult.Id],
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

exports.updateTradersPortfoliosForBuyTrade = async(buyerTraderId, sellerTraderId, shareCode, amount, callback) => {
  if (connection) {
    connection.beginTransaction(function(error) {
      if(error){
        callback(false);
      }
    });
    const amountResultBuyer = await this.getPortfiliosShareAmount(buyerTraderId, shareCode);
    const newAmountBuyer = Number(amountResultBuyer) + Number(amount);

    var sqlCommandBuyer = "UPDATE tradersportfolios SET ShareAmount = ? WHERE traderId = ? AND ShareCode = ?";
    connection.query(sqlCommandBuyer, [newAmountBuyer, buyerTraderId, shareCode],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )

    const amountResultSeller = await this.getPortfiliosShareAmounts(sellerTraderId, shareCode);
    const newAmountSeller = Number(amountResultSeller.ShareBlockedAmount) - Number(amount);
    
    var sqlCommandSeller = "UPDATE tradersportfolios SET ShareBlockedAmount = ? WHERE traderId = ? AND ShareCode = ?";
    connection.query(sqlCommandSeller, [newAmountSeller, sellerTraderId, shareCode],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )
    connection.commit(function(error){
      if(error){
        connection.rollback(function () {
          callback(false);
        });
      }
    });
    callback(true);
  }
  else {
    callback(false);
  }
};

exports.updateTradersPortfoliosForSellTrade = async(sellerTraderId, buyerTraderId, shareCode, amount, callback) => {
  if (connection) {
    connection.beginTransaction(function(error) {
      if(error){
        callback(false);
      }
    });

    const amountResultSeller = await this.getPortfiliosShareAmount(sellerTraderId, shareCode);
    const newAmountSeller = Number(amountResultSeller) - Number(amount);
    
    var sqlCommandSeller = "UPDATE tradersportfolios SET ShareAmount = ? WHERE traderId = ? AND ShareCode = ?";
    connection.query(sqlCommandSeller, [newAmountSeller, sellerTraderId, shareCode],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )

    const amountResultBuyer = await this.getPortfiliosShareAmount(buyerTraderId, shareCode);
    const newAmountBuyer = Number(amountResultBuyer) + Number(amount);

    var sqlCommandBuyer = "UPDATE tradersportfolios SET ShareAmount = ? WHERE traderId = ? AND ShareCode = ?";
    connection.query(sqlCommandBuyer, [newAmountBuyer, buyerTraderId, shareCode],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )
    
    connection.commit(function(error){
      if(error){
        connection.rollback(function () {
          callback(false);
        });
      }
    });
    callback(true);
  }
  else {
    callback(false);
  }
};