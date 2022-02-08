var SellTrade = function(params) {
  this.registeredShareId = params.registeredShareId;
  this.shareCode = params.shareCode;
  this.sellAmount = params.sellAmount;
  this.sellerTraderId = params.sellerTraderId;  
};

module.exports = SellTrade;