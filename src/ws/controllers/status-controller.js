module.exports = function(server) {
    server.get('/status/healthcheck', function (req, res, next) {
        res.status = 200;
        res.send('all systems nominal\n');
        return next();
    });
};
