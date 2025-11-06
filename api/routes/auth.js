
module.exports = function (server, restify) {

  server.post('/login', (req, res, next) => {
    const body = req.body || {};

    
    // authController.loginUser(body, (result) => {
    AUTHCONTROLLER.loginUser(body, (result) => {
      const status = result.status ? 200 : 401;
      res.send(status, result);
      next();
    });
  });

 
};
