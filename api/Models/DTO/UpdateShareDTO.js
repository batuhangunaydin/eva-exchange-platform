var UpdateShareDTO = function(params) {
    this.id = params.id;
    this.traderId = params.traderId;
    this.shareCode = params.shareCode;
    this.newPrice = params.newPrice;
  };
  
  module.exports = UpdateShareDTO;