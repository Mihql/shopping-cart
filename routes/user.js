var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const session = require("express-session");

const verfiyLogin = (req, res, next) => {
  if (
    req.session.user &&
    req.session.user.hasOwnProperty("loggedIn") &&
    req.session.user.loggedIn == true
  )
    next();
  else res.redirect("/login");
};

/* GET home page. */
router.get("/", async function (req, res) {
  let user = req.session.user;
  console.log(user);
  let userr = req.session.user;
  let cartCount = null;
  if (userr) {
    cartCount = await userHelpers.getCartCount(req.session.user._id); // fetching user _id session
  }

  productHelpers.getAllProducts().then((products) => {
    res.render("users/view-products", { products, user, cartCount });
  });
});

router.get("/login", function (req, res) {
  if (req.session.user) {
    console.log("user----", req.session.user, "----user");
    res.redirect("/");
  } else {
    res.render("users/login", { LoginError: req.session.userLoginError });
    req.session.userLoginError = false;
  }
});

router.get("/signup", function (req, res) {
  res.render("users/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log("Intel------", response, "------Intel");

    req.session.user = response;
    req.session.user.loggedIn = true;
    res.render("users/login");
  });
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((responce) => {
    if (responce.status) {
      // if status is true

      req.session.user = responce.user; // passed user intel to session.user
      req.session.user.loggedIn = true;
      res.redirect("/");
    } else {
      // res.session.userLogginError="Invalid username or password"
      res.redirect("/login");
    }
  });
});

router.get("/logout", function (req, res) {
  req.session.user = null;
  inProfile = null;
  req.session.user.loggedIn = false;
  res.redirect("/");
});

router.get("/profile", verfiyLogin, async (req, res) => {
  let profile = await userHelpers.userProfile(req.session.user._id);
  let user = req.session.user;
  let inProfile = true;
  console.log(profile, "PROFILE#####################");
  res.render("users/profile", { profile, user });
});

router.get("/cart", verfiyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id); // passing user of session
  let totalValue = 0;
  console.log(
    "PRODUCT ARRAY LENGHT--------",
    products.length,
    "--------PRODUCT ARRAY LENGHT"
  );
  if (products.length > 0) {
    totalValue = await userHelpers.getTotalAmount(req.session.user._id);
  }
  console.log("++_++" + req.session.user._id);
  let user = req.session.user;
  res.render("users/cart", { products, user, totalValue }); // passing user of session
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    // fetching user id from session
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  // console.log(req.body);
  console.log("here-test-test");
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user); // appending total to response, passing totalAmount to ajax
    res.json(response);
  });
});

router.post("/remove-product", (req, res) => {
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verfiyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("users/place-order", { total, user: req.session.user });
});

router.post("/order-checkout", async (req, res) => {
  console.log(
    "_____________+________________",
    req.body,
    "_____________+________________"
  );
  console.log("body.user---", req.body.userId, "---body.user");
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    // order _id
    if (req.body["check"] == "COD") {
      res.json({ codSuccess: true });
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
        console.log("razerpay api called");
      });
    }
  });
});

router.post("/verify-payment", (req, res) => {
  console.log("paymentGateway---", req.body, "---PaymentGateway");
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("payment successfull");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err, "error");
      res.json({ status: false, errMsg: "" });
    });
});

router.get("/order-success", verfiyLogin, (req, res) => {
  res.render("users/order-success", { user: req.session.user });
});

router.get("/orders", verfiyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  res.render("users/orders", { user: req.session.user, orders });
});

router.get("/ordered-view-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id); // collection order _id
  res.render("users/ordered-view-products", {
    user: req.session.user,
    products,
  });
});

module.exports = router;
