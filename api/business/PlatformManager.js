const connection = require("../config/db.config");
const BuyTrade = require("../Models/Platform/BuyTrade");
const RegisterShareDTO = require("../Models/DTO/RegisterShareDTO");
const constants = require("../config/constants");
const tradersPortfoliosRepository = require("../repository/TradersPortfoliosRepository");
const tradersRepository = require("../repository/TradersRepository");
const registeredSharesRepository = require("../repository/RegisteredSharesRepository");
const req = require("express/lib/request");

// Controls before function Register Share. Checking trader's balance, share amount etc.
exports.registerShare = async(share, callback) => {
  //Return an error message if any data is blank
  if((!share.shareName) || (!share.shareCode) || (!share.tradeSide) || isNaN(share.traderId) || isNaN(share.registeredAmount) || isNaN(share.sharePrice)){
    return callback(false, constants.emptyInput);
  } 
  
  //TraderId Check
  if(share.traderId <= 0){
    return callback(false, constants.traderIdError);
  }

  //Amount Check
  if(share.registeredAmount <= 0){
    return callback(false, constants.registerAmountError);
  }

  //Price Check
  if(share.sharePrice <= 0){
    return callback(false, constants.priceError);
  }

  //Trader portfolio check
  const isTruePortfolio = await tradersPortfoliosRepository.checkTraderPortfolio(share.traderId, share.shareCode);
 
  if (!isTruePortfolio) {
    return callback(false, constants.portfolioError);
  } 

  //If register transaction side buy, checking trader's balance 
  if (share.tradeSide == constants.buySide){
    const traderBalance = await tradersRepository.getTraderBalance(share.traderId);
    const shareTotalBuyPrice = (share.registeredAmount * share.sharePrice).toFixed(2);
  
    if (traderBalance < shareTotalBuyPrice){
      return callback(false, constants.traderBalanceError);
    }
  }
  else if (share.tradeSide == constants.sellSide){ //If register transaction side sell, checking trader's share amount
    const portfoliosShareAmount = await tradersPortfoliosRepository.getPortfiliosShareAmount(share.traderId, share.shareCode);
    
    if (portfoliosShareAmount < share.registeredAmount){
      return callback(false, constants.shareAmountError);
    }
  }
  else {
    return callback(false, constants.tradeSideError);
  }

  return callback(true);

};

// Controls before function of Update Price of Trader's Registered Share. Checking trader's balance, share amount, new price, last update time etc.
exports.updateSharePrice = async(share, callback) => {
  //Return an error message if any data is blank
  if(isNaN(share.id) || isNaN(share.traderId) || (!share.shareCode) || isNaN(share.newPrice)){
    return callback(false, constants.emptyInput);
  }

  //Id Check
  if(share.id <= 0){
    return callback(false, constants.idError);
  }

  //TraderId Check
  if(share.traderId <= 0){
    return callback(false, constants.traderIdError);
  }

  //Share Price Check
  if(share.newPrice <= 0){
    return callback(false, constants.priceError);
  }

  //Registered share check in database
  const reqShare = await registeredSharesRepository.checkRegisteredShare(share.id, share.traderId, share.shareCode);
  
  if (reqShare === null) {
    return callback(false, constants.checkRegisteredShareError);
  } 

  //Last Update Date Check
  const dateNow = new Date();
  const hoursDifference = Math.abs(dateNow - reqShare.LastUpdateDate) / 36e5;;
  
  if (hoursDifference < 1){
    return callback(false, constants.updateRegisteredShareDateError);
  }

  //If registered transaction side buy and new price is bigger than old price, check trader's balance
  if((share.newPrice > reqShare.SharePrice) && (reqShare.TradeSide == constants.buySide)){
    const priceDifference = Number(share.newPrice) - Number(reqShare.SharePrice);
    const traderBalance = await tradersRepository.getTraderBalance(share.traderId);
    const shareTotalBuyPriceDifference = (Number(reqShare.RegisteredAmount) * Number(priceDifference)).toFixed(2);
    
    //if trader hasn't enough balance for update price
    if(traderBalance < shareTotalBuyPriceDifference){
      return callback(false, constants.traderBalanceError);
    }
  }

  return callback(true, reqShare);
};

// Controls before function of Buy a Registered Share. Checking amount, price etc.
exports.buyRegisteredShare = async(trade, callback) => {
  //Return an error message if any data is blank
  if(isNaN(trade.registeredShareId) || (!trade.shareCode) || isNaN(trade.buyAmount) || isNaN(trade.buyerTraderId)){
    return callback(false, constants.emptyInput);
  }

  //Registered Id Check
  if(trade.registeredShareId <= 0){
    return callback(false, constants.registeredShareIdError);
  }

  //Buy Amount Check
  if(trade.buyAmount <= 0){
    return callback(false, constants.registerAmountError);
  }

  //Buyer Trader Id Check
  if(trade.buyerTraderId <= 0){
    return callback(false, constants.traderIdError);
  }

  //Trader portfolio check
  const isTruePortfolio = await tradersPortfoliosRepository.checkTraderPortfolio(trade.buyerTraderId, trade.shareCode);
 
  if (!isTruePortfolio) {
    return callback(false, constants.portfolioError);
  } 

  //Get Registered Share Record for check
  const reqShare = await registeredSharesRepository.getRegisteredShare(trade.registeredShareId);
  
  //Record check
  if (reqShare === null) {
    return callback(false, constants.checkRegisteredShareError);
  } 

  //Check registered share's trade side, Should be SELL for this trader!
  if(reqShare.TradeSide != constants.sellSide){
    return callback(false, constants.registeredShareBuySideError);
  }

  //Check amount of registered share and trade amount
  if(reqShare.RegisteredAmount < trade.buyAmount){
    return callback(false, constants.amountCheckError);
  }

  //Check trader's balance for this transaction
  const traderBalance = await tradersRepository.getTraderBalance(trade.buyerTraderId);
  const totalAmount = reqShare.SharePrice * trade.buyAmount;

  if(traderBalance < totalAmount){
    return callback(false, constants.traderBalanceError);
  }

  return callback(true, reqShare);
};

// Controls before function of Sell a Registered Share. Checking amount, price etc.
exports.sellRegisteredShare = async(trade, callback) => {
  //Return an error message if any data is blank
  if(isNaN(trade.registeredShareId) || (!trade.shareCode) || isNaN(trade.sellAmount) || isNaN(trade.sellerTraderId)){
    return callback(false, constants.emptyInput);
  }

  //Registered Id Check
  if(trade.registeredShareId <= 0){
    return callback(false, constants.registeredShareIdError);
  }

  //Buy Amount Check
  if(trade.sellAmount <= 0){
    return callback(false, constants.registerAmountError);
  }

  //Buyer Trader Id Check
  if(trade.buyerTraderId <= 0){
    return callback(false, constants.traderIdError);
  }

  //Trader portfolio check
  const isTruePortfolio = await tradersPortfoliosRepository.checkTraderPortfolio(trade.sellerTraderId, trade.shareCode);
 
  if (!isTruePortfolio) {
    return callback(false, constants.portfolioError);
  } 

  //Get Registered Share Record for check
  const reqShare = await registeredSharesRepository.getRegisteredShare(trade.registeredShareId);
  
  //Record check
  if (reqShare === null) {
    return callback(false, constants.checkRegisteredShareError);
  } 

  //Check registered share's trade side, Should be BUY for this trader!
  if(reqShare.TradeSide != constants.buySide){
    return callback(false, constants.registeredShareSellSideError);
  }

  //Check amount of registered share and trade amount
  if(reqShare.RegisteredAmount < trade.sellAmount){
    return callback(false, constants.amountCheckError);
  }

  //Check trader's balance for this transaction
  const sellerAmount = await tradersPortfoliosRepository.getPortfiliosShareAmount(trade.sellerTraderId, trade.shareCode);

  if(sellerAmount < trade.sellAmount){
    return callback(false, constants.traderBalanceError);
  }


  return callback(true, reqShare);
}

