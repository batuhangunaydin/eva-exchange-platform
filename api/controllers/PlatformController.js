const platformManager = require("../business/PlatformManager");
const logsRepository = require("../repository/TransactionLogsRepository");
const tradersRepository = require("../repository/TradersRepository");
const registeredSharesRepository = require("../repository/RegisteredSharesRepository");
const tradersPortfoliosRepository = require("../repository/TradersPortfoliosRepository");
const constants = require("../config/constants");
const BuyTrade = require("../Models/Platform/BuyTrade");
const RegisterShareDTO = require("../Models/DTO/RegisterShareDTO");
const UpdateShareDTO = require("../Models/DTO/UpdateShareDTO");
const LogDTO = require("../Models/DTO/LogDTO");
const RegisteredShare = require("../Models/Platform/RegisteredShare");
const SellTrade = require("../Models/Platform/SellTrade");


// Function that allows the trader to record the stock their owns
module.exports.registerShare = async function (req, res) {
    var share = new RegisterShareDTO(req.body);
    //Initial checks
    platformManager.registerShare(share, (error, result) => {
        if(!error){
            //If an error occurred in any of the initial checks, we return the error.
            return res.status(400).send({
                success: false,
                data : result
            });
        } 
        //The request is being created in the database
        registeredSharesRepository.createRecord(share, (error, result) => {
            if(error && result > 0){ //If register was successful
                if(share.tradeSide == constants.buySide){ //If register side is buy, update trader's balance and blocked balance
                    const totalAmount = (share.registeredAmount * share.sharePrice).toFixed(2);
                    tradersRepository.updateTradersBalanceForRegisterShare(share.traderId, totalAmount, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.registerShareError
                            });
                        } 
                        else {
                            return res.status(200).send({
                                success: true,
                                data : constants.registerShareSuccess
                            });
                        }
                    });
                } 
                else if(share.tradeSide == constants.sellSide){ //If register side is sell, update trader's share amount
                    tradersPortfoliosRepository.updateTradersPortfolioForRegisterShare(share.traderId, share.shareCode, share.registeredAmount, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.registerShareError
                            });
                        } 
                        else {
                            return res.status(200).send({
                                success: true,
                                data : constants.registerShareSuccess
                            });
                        }
                    });
                }   
            }
        });
    });

}

// Function that allows the get all traders records
module.exports.getAllTraders = async function (req, res) {
    tradersRepository.getAllTraders((error, result) => {
        if(error){
            return res.status(400).send({ 
                success: false, 
                data: consants.badRequestMsg 
            });
        }
        return res.status(200).send({
            success : true,
            data : result
        })
    });
}

// Function that allows the get all portfolios records
module.exports.getAllPortfolios = async function (req, res) {
    tradersPortfoliosRepository.getAllPortfolios((error, result) => {
        if(error){
            return res.status(400).send({ 
                success: false, 
                data: consants.badRequestMsg 
            });
        }
        return res.status(200).send({
            success : true,
            data : result
        })
    });
}

// Function that allows the get all registered shares
module.exports.getAllRegisteredShares = async function (req, res) {
    registeredSharesRepository.getAllRegisteredShares((error, result) => {
        if(error){
            return res.status(400).send({ 
                success: false, 
                data: consants.badRequestMsg 
            });
        }
        return res.status(200).send({
            success : true,
            data : result
        })
    });
}

// Function that allows the get all transaction logs
module.exports.getAllLogs = async function (req, res) {
    logsRepository.getAllLogs((error, result) => {
        if(error){
            return res.status(400).send({ 
                success: false, 
                data: consants.badRequestMsg 
            });
        }
        return res.status(200).send({
            success : true,
            data : result
        })
    });
};

// Function that allows the trader to update a registered share
module.exports.updatePriceRegisteredShare = async function (req, res) {
    var share = new UpdateShareDTO(req.body);
    //Initial checks
    platformManager.updateSharePrice(share, (error, resultShare) => {
        if(!error){
            return res.status(400).send({
                success: false,
                data : resultShare
            });
        } 
        const dateNow = new Date();
        
        //Update registered share's price and lastUpdateDate
        registeredSharesRepository.updatePriceAndDate(resultShare.Id, share.newPrice, dateNow, (error, result) => {
            if(!error){
                return res.status(400).send({
                    success: false,
                    data : constants.updateRegisteredShareError
                })
            }
            //If trade side is BUY, update trader's balance and blocked balance values
            if(resultShare.TradeSide == constants.buySide){
                const priceDifference = Number(share.newPrice) - Number(resultShare.SharePrice);
                const totalAmount = priceDifference * resultShare.RegisteredAmount;
                
                tradersRepository.updateTradersBalanceForRegisterShare(share.traderId, totalAmount, (error) => {
                    if(!error){
                        return res.status(400).send({
                            success: false,
                            data : constants.updateRegisteredShareError
                        });
                    } 
                    else {
                        return res.status(200).send({
                            success: true,
                            data : constants.updateShareSuccessful
                        });
                    }
                });
            }
            else if(resultShare.TradeSide == constants.sellSide){
                return res.status(200).send({
                    success: true,
                    data : constants.updateShareSuccessful
                });
            }
        });
    });

}

// Function that allows the trader to buy a registered share
module.exports.buyRegisteredShare = async function (req, res) {
    var trade = new BuyTrade(req.body);
    //Initial checks
    platformManager.buyRegisteredShare(trade, (error, result) => {
        if(!error){
            return res.status(400).send({
                success: false,
                data : result
            });
        }
        //
        const totalPrice = (trade.buyAmount * result.SharePrice).toFixed(2);
        tradersRepository.updateTradersBalancesForBuyTrade(trade.buyerTraderId, result.traderId, totalPrice, (error) => {
            if(!error){
                return res.status(400).send({
                    success: false,
                    data : constants.tradeError
                });
            }
            tradersPortfoliosRepository.updateTradersPortfoliosForBuyTrade(trade.buyerTraderId, result.traderId, trade.shareCode, trade.buyAmount, (error) => {
                if(!error){
                    return res.status(400).send({
                        success: false,
                        data : constants.tradeError
                    });
                }
                if(trade.buyAmount == result.RegisteredAmount){
                    registeredSharesRepository.deleteRecord(result.Id, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.tradeError
                            });
                        }   
                        var paramsBuyer = {
                            traderId : trade.buyerTraderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.buyAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.buySide,
                            status : constants.successStatus
                        };
                        var logBuyer = new LogDTO(paramsBuyer);
                        logsRepository.createRecord(logBuyer);

                        var paramsSeller = {
                            traderId : result.traderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.buyAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.sellSide,
                            status : constants.successStatus
                        };
                        var logSeller = new LogDTO(paramsSeller);
                        logsRepository.createRecord(logSeller);

                        return res.status(200).send({
                            success: true,
                            data : constants.buyTradeSuccessful
                        });
                    });
                }
                else if (trade.buyAmount < result.RegisteredAmount){
                    registeredSharesRepository.updateRegisteredShareAmount(result.Id, trade.buyAmount, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.tradeError
                            });
                        }  
                        var paramsBuyer = {
                            traderId : trade.buyerTraderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.buyAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.buySide,
                            status : constants.successStatus
                        };
                        var logBuyer = new LogDTO(paramsBuyer);
                        logsRepository.createRecord(logBuyer);

                        var paramsSeller = {
                            traderId : result.traderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.buyAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.sellSide,
                            status : constants.successStatus
                        };
                        var logSeller = new LogDTO(paramsSeller);
                        logsRepository.createRecord(logSeller);

                        return res.status(200).send({
                            success: true,
                            data : constants.buyTradeSuccessful
                        });
                    });
                }
            });
            
        });
        
    });
}

// Function that allows the trader to sell a registered share
module.exports.sellRegisteredShare = async function (req, res) {
    var trade = new SellTrade(req.body);
    //Initial checks

    platformManager.sellRegisteredShare(trade, (error, result) =>{
        if(!error){
            return res.status(400).send({
                success: false,
                data : constants.tradeError
            });
        }
        const totalPrice = (trade.sellAmount * result.SharePrice).toFixed(2);

        tradersRepository.updateTradersBalancesForSellTrade(trade.sellerTraderId, result.traderId, totalPrice, (error) => {
            if(!error){
                return res.status(400).send({
                    success: false,
                    data : constants.tradeError
                });
            }
            tradersPortfoliosRepository.updateTradersPortfoliosForSellTrade(trade.sellerTraderId, result.traderId, trade.shareCode, trade.sellAmount, (error) => {
                if(!error){
                    return res.status(400).send({
                        success: false,
                        data : constants.tradeError
                    });
                }
                if(trade.sellAmount == result.RegisteredAmount){
                    registeredSharesRepository.deleteRecord(result.Id, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.tradeError
                            });
                        }   
                        var paramsSeller = {
                            traderId : trade.sellerTraderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.sellAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.sellSide,
                            status : constants.successStatus
                        };
                        var logSeller = new LogDTO(paramsSeller);
                        logsRepository.createRecord(logSeller);

                        var paramsBuyer = {
                            traderId : result.traderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.sellAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.buySide,
                            status : constants.successStatus
                        };
                        var logBuyer = new LogDTO(paramsBuyer);
                        logsRepository.createRecord(logBuyer);

                        return res.status(200).send({
                            success: true,
                            data : constants.sellTradeSuccessful
                        });
                    });
                }
                else if (trade.sellAmount < result.RegisteredAmount){
                    registeredSharesRepository.updateRegisteredShareAmount(result.Id, trade.sellAmount, (error) => {
                        if(!error){
                            return res.status(400).send({
                                success: false,
                                data : constants.tradeError
                            });
                        }  
                        var paramsSeller = {
                            traderId : trade.sellerTraderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.sellAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.sellSide,
                            status : constants.successStatus
                        };
                        var logSeller = new LogDTO(paramsSeller);
                        logsRepository.createRecord(logSeller);

                        var paramsBuyer = {
                            traderId : result.traderId,
                            shareCode : trade.shareCode,
                            shareAmount : trade.sellAmount,
                            sharePrice : result.SharePrice,
                            tradeSide : constants.buySide,
                            status : constants.successStatus
                        };
                        var logBuyer = new LogDTO(paramsBuyer);
                        logsRepository.createRecord(logBuyer);

                        return res.status(200).send({
                            success: true,
                            data : constants.sellTradeSuccessful
                        });
                    });
                }
            });
        });
    });
    

}