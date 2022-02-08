var RegisterShareDTO = function(params) {
    this.traderId = params.traderId;
    this.shareName = params.shareName;
    this.shareCode = params.shareCode;
    this.registeredAmount = params.registeredAmount;
    this.sharePrice = params.sharePrice;
    this.tradeSide = params.tradeSide;
  };
  
  module.exports = RegisterShareDTO;