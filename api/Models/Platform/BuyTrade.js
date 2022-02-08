var BuyTrade = function(params) {
    this.registeredShareId = params.registeredShareId;
    this.shareCode = params.shareCode;
    this.buyAmount = params.buyAmount;
    this.buyerTraderId = params.buyerTraderId;  
  };
  
  module.exports = BuyTrade;