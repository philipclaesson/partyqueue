var preflight = {};

preflight.check = function (req, res, next) {
      // console.log(req.headers)
      var preflightMethod = 'GET,PUT,POST,DELETE,OPTIONS';// req.headers['access-control-request-method'];  // Maybe just hardcode GET, POST
      var preflightHeader = 'token';// req.headers['access-control-request-headers'];
      // var preflightOrigin = 'http://localhost:8080, https://klimato.se, http://klimato.se, www.klimato.se' // req.headers['origin']
      var preflightOrigin = '*';
      console.log("Responding. Origin: " + preflightOrigin);
      headers = {
        'access-control-allow-origin': preflightOrigin,
        'Access-Control-Allow-Methods': preflightMethod,
        'Access-Control-Allow-Headers': "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers" // 'Access-Control-Allow-Headers' + preflightHeader + ', Content-Type'
      }

      // res.status(200);
      console.log(res._headers)
      console.log(preflightOrigin)
      res.status(200)
      res.setHeader('access-control-allow-methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.setHeader('access-control-allow-headers', "token, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");//preflightHeader);
      res.setHeader('access-control-allow-credentials', true);
      res.setHeader('Access-Control-Allow-Origin', preflightOrigin);
      console.log("res: " + res.getHeader('access-control-allow-origin'));
    if (req.method == "OPTIONS"){
      console.log("Preflight detected")
      res.send();
    } else {
      console.log('Normal request incoming. ')
      next()
    }
  }

  module.exports = preflight;
