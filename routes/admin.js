var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')

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

module.exports = router;
