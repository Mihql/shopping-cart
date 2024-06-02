var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const { response } = require('../app');

const verfiyLogin= (req, res, next) => {
  if(req.session.admin.loggedIn)
  next()
  else
  res.redirect('/login')
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products', {products, admin:true});
  })
  
});


router.get('/add-products', function(req, res){
  res.render('admin/add-products')
})


router.post('/add-products', function(req, res){
console.log(req.body);
console.log(req.files.Image);

  productHelpers.addProduct(req.body, function(id){
    console.log(req.body);
    let image = req.files.Image
    console.log(id);
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err){
        res.render('admin/add-products')
      }else{
        console.log(err);
      }
    })
  
  })

})

router.get('/delete-product/:id', (req, res) => {
  let proID=req.params.id
  console.log(proID);
  productHelpers.deleteProduct(proID).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product', {product})
})

router.post('/edit-products/:id', (req, res) => {
  let id =req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})

router.get("/login-admin", function (req, res) {
  if(req.session.admin){
  console.log("user----",req.session.admin,"----user")
  res.redirect('/admin')
  console.log("SUSSSSSSSSSSSSSSSSSS")
  }else {
  res.render("admin/login-admin")
  console.log("POST /LOGIN-ADMIN")
  }
});

router.post('/login-admin', (req, res) => {
  productHelpers.doLogin(req.body).then((responce) =>{
    console.log(req.body,"###########admin-body")
    if(responce.status){ // if status is true 

      req.session.admin=responce.user
      req.session.admin.loggedIn=true
      res.redirect('/admin')
      console.log("SSSSSSSSSSUSSSSSSSSSSSSSSSYYYYYYYYYYY")
    }else{
      // req.session.adminLogginError="Invalid username or password"
      res.redirect('/admin/login-admin')  
    }
  })
})

router.get('/all-orders', async(req, res)=>{
  let allOrders = await productHelpers.getAllOrders()
  let user = req.session.admin
  res.render('admin/all-orders', {allOrders, user, admin:true})
})

router.get('/all-users', async(req, res)=>{
  let allUsers = await productHelpers.getAllUsers()
  let user = req.session.admin
  console.log(allUsers, "allUsers#####################")
  res.render('admin/all-users', {allUsers, user, admin:true})
})


//action button / call




module.exports = router;
