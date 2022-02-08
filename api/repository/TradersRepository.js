const constants = require("../config/constants");
const connection = require("../config/db.config");

exports.getAllTraders = (callback) => {
  if (connection) {
    var sqlCommand = "SELECT * FROM traders";
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


exports.getTraderBalance = async(traderId) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT Balance FROM traders WHERE Id = ?";
      connection.query(sqlCommand, traderId,
        (err, rows) => {
          if (err) {
            reject(0);
          }
          else {
            if(rows.length <= 0){
              resolve(0);
            }else {
              resolve(rows[0].Balance);
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


exports.getTraderBalances = async(traderId) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      var sqlCommand = "SELECT Balance, BlockedBalance FROM traders WHERE Id = ?";
      connection.query(sqlCommand, traderId,
        (err, rows) => {
          if (err) {
            reject(0);
          }
          else {
            if(rows.length <= 0){
              resolve(0);
            }else {
              resolve(rows[0]);
            }
          }
        }
      )
    }
    else{
      reject(0);
    }
  });
};


exports.updateTradersBalanceForRegisterShare = async(traderId, amount, callback) => {
    if (connection) {
      const balanceResult = await this.getTraderBalances(traderId);
      const newBalance = Number(balanceResult.Balance) - Number(amount);
      const newBlockedBalance = Number(balanceResult.BlockedBalance) + Number(amount);

      var sqlCommand = "UPDATE traders SET Balance = ?, BlockedBalance = ? WHERE Id = ?";
      connection.query(sqlCommand, [newBalance, newBlockedBalance,traderId],
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


exports.updateTradersBalancesForBuyTrade = async(buyerTraderId, sellerTraderId, amount, callback) =>{
  if(connection){
    connection.beginTransaction(function(error) {
      if(error){
        callback(false);
      }
    });
    const balanceResultBuyer = await this.getTraderBalances(buyerTraderId);
    const newBalanceBuyer = Number(balanceResultBuyer.Balance) - Number(amount);
    var sqlCommandBuyer = "UPDATE traders SET Balance = ? WHERE Id = ?";
    connection.query(sqlCommandBuyer, [newBalanceBuyer, buyerTraderId],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )

    const balanceResultSeller = await this.getTraderBalances(sellerTraderId);
    const newBalanceSeller = Number(balanceResultSeller.Balance) + Number(amount);
    var sqlCommandSeller = "UPDATE traders SET Balance = ? WHERE Id = ?";
    connection.query(sqlCommandSeller, [newBalanceSeller, sellerTraderId],
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
}

exports.updateTradersBalancesForSellTrade = async(sellerTraderId, buyerTraderId, amount, callback) =>{
  if(connection){
    connection.beginTransaction(function(error) {
      if(error){
        callback(false);
      }
    });

    const balanceResultSeller = await this.getTraderBalances(sellerTraderId);
    const newBalanceSeller = Number(balanceResultSeller.Balance) + Number(amount);
    var sqlCommandSeller = "UPDATE traders SET Balance = ? WHERE Id = ?";
    connection.query(sqlCommandSeller, [newBalanceSeller, sellerTraderId],
      (err) => {
        if (err) {
          connection.rollback(function() {
            callback(false);
          });
        }
      }
    )
    
    const balanceResultBuyer = await this.getTraderBalances(buyerTraderId);
    const newBlockedBalanceBuyer = Number(balanceResultBuyer.BlockedBalance) - Number(amount);
    var sqlCommandBuyer = "UPDATE traders SET BlockedBalance = ? WHERE Id = ?";
    connection.query(sqlCommandBuyer, [newBlockedBalanceBuyer, buyerTraderId],
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
}