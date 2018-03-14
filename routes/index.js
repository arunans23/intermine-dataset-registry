
var express = require('express');
var router = express.Router();


/**
 * Endpoint:  /
 * Method:    GET
 * Description: Render home page.
 */
router.get('/', function(req, res, next) {
    if (typeof (req.query.success)){
      var operation = req.query.success;
      if (operation == 1){
        return res.render('index', { user: req.user, message: "Instance Added Successfully" });
      } else if (operation == 2) {
        return res.render('index', { user: req.user, message: "Instance Updated Successfuly" });
      }
    }
    return res.render('index', { user: req.user });
});

module.exports = router;
