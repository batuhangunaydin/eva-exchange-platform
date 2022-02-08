var LogDTO = function(params) {
    this.traderId = params.traderId;
    this.shareCode = params.shareCode;
    this.shareAmount = params.shareAmount;
    this.sharePrice = params.sharePrice;
    this.tradeSide = params.tradeSide;
    this.status = params.status;
  };
  
  module.exports = LogDTO;