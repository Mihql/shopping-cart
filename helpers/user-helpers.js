var db = require("../config/connection");
var userCollection = require("../config/collections");

const bcrypt = require("bcrypt"); // Import the bcrypt library
const collections = require("../config/collections");
const { response } = require("../app");
// const ObjectId = require('mongodb').ObjectId;
const { ObjectId } = require('mongodb');

const Razorpay = require('razorpay');
const { parse } = require("handlebars");
const { resolve } = require("node:path");

var instance = new Razorpay({
  key_id: 'rzp_test_BDQmMGiipzVkjV',
  key_secret: 'hSnl3dSXsMB03ZOaW9rLhgkn',
});

// module.exports={
//     doSignup: (userData) => {
//         return new Promise(async(resolve, reject) => {
//         userData.Password =await bcrypt.hash(userData.Password, 10)
//          db.get().collection(userCollection.USER_COLLECTION).insertOne(userData).then((result) => {
//          resolve(result.ops[0])
//          })
//         })
//     }
// }


module.exports = {

  getCartCount:(UserID) => {
    const UserId = new ObjectId(UserID)
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:UserId})
      if(cart){
        count=cart.products.length
      }
      resolve(count)
    })
  },

  doSignup: (userData) => {
    console.log("USERDATA-----------",userData,"------------USERDATA")
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      console.log("PASSWORD-----------",userData.password,"------------USERDATA")
      db.get()
        .collection(collections.USER_COLLECTION)
        .insertOne(userData).then((result) => {
          console.log(result.insertedId,"--------RESULT")
           resolve(result.insertedId);
        })
    });
  },

    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
        let userLogginError=false
        let responce={}
        let user= await db.get().collection('user').findOne({email :userData.email});
        if(user) {
            const result = await bcrypt.compare(userData.password, user.password)
                if (result) {
                    console.log(result)
                    console.log("success")
                    responce.user = user
                    responce.status = true
                    // loginStatus = true;
                    // responce.message = 'Login Successfull';
                    // responce.status = 200;
                    // responce.data = user;
                    resolve(responce)
                }

                else {
                    console.log("login failed")
                    // responce.message = 'Invalid Password';
                    // responce.status = 400;
                    resolve({status: false})
                }
        }
        else{
            // responce.message = 'Login';
            console.log('create new account')
            resolve({status: false})
        }
    })
},
userProfile:(userID)=>{
  const userId = new ObjectId(userID)
  return new Promise ( async(resolve, reject) => {
    let userProfile =  await db.get().collection(collections.USER_COLLECTION)
      .findOne({ _id: userId })
        resolve(userProfile)
        console.log(userProfile, "RESOLVE USERPROFILE+++++++++++++++")
  })
},
addToCart:(proID, userID) => {
  const userId = new ObjectId(userID)
  const proId = new ObjectId(proID)
  let proObJ ={
    item:proId,
    quantity:1
  }
  return new Promise(async (resolve, reject)=>{
    let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user: userId})
    if(userCart){
      let proExit = userCart.products.findIndex(product=> product.item==proID) // checks == item, proid
      console.log(proExit);
      if(proExit!=-1){
        db.get().collection(collections.CART_COLLECTION)
        .updateOne({user:userId, 'products.item':proId}, // base in 
        {
            $inc:{'products.$.quantity':1} // increment quantity
        }
      ).then(() => {
        resolve() 
      })
      }
      else
      {
      db.get().collection(collections.CART_COLLECTION).
      updateOne({user:userId},
        {
        
            $push:{products:proObJ}


        }).then(()=>{
          resolve()
        })
      }
    }
    else{
      let cartObj={
        user:(userId),
        products:[proObJ] 
      }
      db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then(()=>{
        resolve()
      })
    }
  })
},
getCartProducts:(userID) => {
  const userId = new ObjectId(userID)
  return new Promise (async (resolve, reject) => {
    // let responce =await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
    //         resolve(responce)
    let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
      {
          $match:{user: userId}
      },
      {
          $unwind:'$products' // unwind products array from CART_COLLECTION
      },
      {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity', // shapes the products from unwind products
          }
      },
      {
          $lookup:{
            from:collections.PRODUCT_COLLECTION, // quality matching from 
            localField:'item', // from unwind products
            foreignField:'_id', // from PRODUCT_COLLECTON
            as:'product' // array
          }
      },
      {
        $project:{
          item:1,quantity:1,product:{$arrayElemAt:['$product', 0]} // { // product, // }
        }
      },
    ]).toArray()

    console.log(cartItems, "cartItems-log")
    // console.log(cartItems[0].product, "product[[]]-log");
    resolve(cartItems)
  })
},
changeProductQuantity:(details)=>{
  const proid =new ObjectId(details.product)
  const cartid=new ObjectId(details.cart)
  
  // console.log(cartid, "cartID");
  // console.log(proid, "proID")
  count=parseInt(details.count)
  
  return new Promise ( (reslove, reject)=>{
    console.log("COUNT#########################",details.count,"#########################QUANTITY",+details.quantity, "#########################QUNATITY")
    if(details.quantity==1 && details.count==-1){
      db.get().collection(collections.CART_COLLECTION)
      .updateOne({_id:cartid},
      {
        $pull:{products: {item:proid}}
      }).then((response)=>{
        reslove({removeProduct:true})
      })
    }else{
      db.get().collection(collections.CART_COLLECTION)
      .updateOne({_id:cartid, 'products.item':proid}, // base in two matching cardID of with proID
      {
          $inc:{'products.$.quantity':count} // increment quantity
      }).then((response)=>{
        reslove({status:true}) // as object {response}
      })
    }
  })
},
removeProduct:(details)=>{
  const cartid = new ObjectId(details.cart)
  const proid = new ObjectId(details.product)
  
  return new Promise ( (resolve, reject)=>{
    db.get().collection(collections.CART_COLLECTION)
    .updateOne({_id:cartid},
       {
        $pull: {products: {item:proid}}
      }).then( ()=>{
        resolve(true)
      })
  })
},
getTotalAmount:(userID)=>{
  const userid = new ObjectId(userID)
  return new Promise(async (resolve, reject)=>{
    let totalCost= await db.get().collection(collections.CART_COLLECTION)
    .aggregate([
      {
        $match:{user:userid}
      },
      {
        $unwind:'$products' 
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:collections.PRODUCT_COLLECTION,
          localField:'item',
          foreignField:'_id', //db collection product _id
          as:'product'
        }
      },
      {
        $project:{item:1,quantity:1,product:{$arrayElemAt:['$product', 0]}}
      },
      {
        $group:{
          _id:null,
          total:{$sum:{$multiply: [{$toDouble:'$product.price'}, {$toDouble:'$quantity'}]}}
        }
      }
    ]).toArray() // changed to array in favor of aggregate
    // console.log(totalCost[0].total) // taking 0th element becus of array
    if (totalCost && totalCost[0] && totalCost[0].total !== undefined){
      resolve(totalCost[0].total)
    }else{
      resolve(0); // or resolve(undefined), depending on your needs
      console.log("Total cost not found");
    }
    })

},
placeOrder:(order,products,totalPrice)=>{
  return new Promise(async(resolve, reject)=>{
    console.log("+++_____++++#",order,products,totalPrice,"+++_____++++#")
    let status=order.check==='COD'?'placed':'pending'
    let orderObj={
      deliveryDetails:{
        phone:order.phone,
        mail:order.email,
        name:order.firstname,
        address:order.address
      },
      userId:new ObjectId(order.userId),
      payment:order.check,
      totalAmount:totalPrice,
      products:products,
      status:status,
      date:new Date()
    }

    const userid = new ObjectId(order.userId)
    db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
      db.get().collection(collections.CART_COLLECTION).deleteOne({user:userid})
      console.log("RESPONCE___",response.insertedId,"___RESPONCE")
      resolve(response.insertedId) // response from insertOne ORDER_COLLECTION
    })


  })
},
getCartProductList: (userId) => {
  const userid = new ObjectId(userId);
  console.log("USERID__", userid, "__USERID");
  return new Promise(async (resolve, reject) => {
      try {
          let cart = await db.get().collection(collections.CART_COLLECTION)
              .findOne({ user: userid });
          if (cart && cart.products) {
              resolve(cart.products);
              console.log("cart--",cart,"---cart")
          } else {
              resolve([]);  // Return an empty array if no products found
          }
      } catch (error) {
          console.error("Error fetching cart products:", error);
          reject(error);
      }
  });
},
getUserOrders:(userId)=>{
  const userid = new ObjectId(userId)
  return new Promise(async(resolve, reject)=>{
    let orders=await db.get().collection(collections.ORDER_COLLECTION)
    .find({userId:userid})
    .toArray()
    console.log("orders------------",orders,"----------orders")
    resolve(orders)
  })
},
getOrderProducts:(orderId)=>{
  const orderid = new ObjectId(orderId)
  return new Promise(async(resolve, reject)=>{
    let intel=await db.get().collection(collections.ORDER_COLLECTION)
    .aggregate([
      {
        $match:{_id:orderid}
      },
      {
        $unwind:'$products' 
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:collections.PRODUCT_COLLECTION,
          localField:'item',
          foreignField:'_id', //db collection product _id
          as:'product'
        }
      },
      {
        $project:{item:1,quantity:1,product:{$arrayElemAt:['$product', 0]}}
      },
    ]).toArray()
    console.log(intel, "cartItems-------------------")
    resolve(intel)
  })
},
generateRazorpay:(orderId,totalPrice)=>{
  return new Promise( (resolve,reject)=>{
    instance.orders.create({
    amount: totalPrice*100,
    currency: "INR",
    receipt: orderId,
    notes: {
        key1: "value3",
        key2: "value2"
}
},(error, order) => {
  if (error) {
      console.error("Error creating Razorpay order:", error);
      reject(error);
      return;
  }
  
  console.log("Razorpay order created:", order);
  
  // Resolving the promise with orderId and total
  resolve(order);
  })
})
},
verifyPayment:(details)=>{
  return new Promise ((resolve, reject)=>{
    const {
      createHmac,
    } = require('node:crypto');
    let hmac = createHmac('sha256', 'hSnl3dSXsMB03ZOaW9rLhgkn');

    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);

    let calculatedSignature = hmac.digest('hex');
    console.log(calculatedSignature)
    if(calculatedSignature=== details['payment[razorpay_signature]']){
      resolve()
    }else{
      reject()
    }
  })
},

changePaymentStatus:(orderId)=>{
  const orderid = new ObjectId(orderId);
  return new Promise((resolve, reject) => {
    db.get().collection(collections.ORDER_COLLECTION)
      .updateOne({ _id: orderid }, // Corrected the orderid here
      {
        $set: {
          status: 'placed'
        }
      })
      .then(() => {
        resolve();
      });
  });
}




}




//         .then((result) => {
//                     if (result) {
//                         resolve(data)
//                     } else {
//                         reject('Invalid Password')
//                     }
//                 })
//             } else {
//                 reject('Invalid Email')
//             }
//         })
//         })
//     }
// }

// module.exports = {
//     doSignup: async (userData) => {
//         try {
//             userData.Password = await bcrypt.hash(userData.Password, 10);
//             const result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
//             return result.ops[0];
//         } catch (error) {
//             throw error;
//         }
//     }
// };

// module.exports = {
//     doSignup: (userData) => {
//         return new Promise((resolve, reject) => {
//             bcrypt.hash(userData.password, 10)
//                 .then((hashedPassword) => {
//                     userData.password = hashedPassword;
//                     return db.get().collection(collection.USER_COLLECTION).insertOne(userData);
//                 })
//                 .then((result) => {
//                     resolve(result.ops[0]);
//                 })
//         });
//     }
// };
