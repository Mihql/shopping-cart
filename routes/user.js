var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

/* GET home page. */
router.get("/", function (req, res, next) {
  let user=req.session.user;
  console.log(user);
  productHelpers.getAllProducts().then((products) => {

    res.render("users/view-products", { products, user });
  });
});

router.get("/login", function (req, res) {
  res.render("users/login");
});

router.get("/signup", function (req, res) {
  res.render("users/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
  });
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((responce) =>{
    if(responce.status){ // checking status is true 
      req.session.loggedIn=true
      req.session.user=responce.user
      res.redirect('/')
    }else{
      res.redirect('/login')  
    }
  }) 
  });
  router.get('/logout',(res, req) => {
    req.session.destroy()
    res.redirect('/')
  })

module.exports = router;
