var router = require('express').Router();
var platformController = require('../controllers/PlatformController');

router.get('/getAllTraders', platformController.getAllTraders);
router.get('/getAllPortfolios', platformController.getAllPortfolios);
router.get('/getAllRegisteredShares', platformController.getAllRegisteredShares);
router.get('/getAllLogs', platformController.getAllLogs);
router.post('/registerShare', platformController.registerShare);
router.put('/updatePriceRegisteredShare', platformController.updatePriceRegisteredShare);
router.post('/buyRegisteredShare', platformController.buyRegisteredShare);
router.post('/sellRegisteredShare', platformController.sellRegisteredShare);


module.exports = router;