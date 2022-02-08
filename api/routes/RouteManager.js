var platformRoute = require('./PlatformRoutes');


module.exports = function (app) {
    app.use('/platform', platformRoute);
}
