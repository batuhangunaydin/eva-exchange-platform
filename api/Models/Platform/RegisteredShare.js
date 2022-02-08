var RegisteredShare = function(params) {
    this.id = params.id;
    this.traderId = params.traderId;
    this.shareName = params.shareName;
    this.shareCode = params.shareCode;
    this.registeredAmount = params.registeredAmount;
    this.sharePrice = params.sharePrice;
    this.tradeSide = params.tradeSide;
    this.lastUpdateDate = params.lastUpdateDate;
  };
  
  module.exports = RegisteredShare;