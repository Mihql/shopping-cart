var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('users/view-products', {products});
  })

});

router.get('/login', function(req, res){
  res.render('users/login')
})

router.get('/signup', function(req, res){
  res.render('users/signup')
})

router.post('/signup', (req, res)=>{
   userHelpers.doSignup(req.body).then((responce)=>{
    console.log(responce);
   })
})

module.exports = router;
