var db = require('../config/connection')
var productCollection = require('../config/collections');
const { response } = require('../app');
// var keyId = require('mongodb').objectID
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt"); // Import the bcrypt library
const collections = require('../config/collections');
module.exports={

    addProduct:(_product, _callback)=>{
        
        db.get().collection('product').insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async (resolve, _reject)=>{
            let products =await db.get().collection(productCollection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(_prodID) =>{
        const keyId = new ObjectId(prodID); // Correct way to create ObjectId
        return new Promise((resolve, _reject)=>{
            console.log(prodID);
            // console.log(objectId(prodID));
            db.get().collection(productCollection.PRODUCT_COLLECTION).deleteOne({_id: keyId}).then((responce)=>{
                // console.log(responce);
                resolve(responce)
            })
        })
    },
    getProductDetails:(_ProID) =>{
        const editProID = new ObjectId(ProID);
        return new Promise((resolve, _reject)=>{
            console.log(editProID)
            db.get().collection(productCollection.PRODUCT_COLLECTION).findOne({_id: editProID}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(Id, proDetails) =>{
        const updateID = new ObjectId(Id)
        // const proID = new ObjectId(proDetails)

        return new Promise((resolve, _reject) => {
            console.log(updateID)
            db.get().collection(productCollection.PRODUCT_COLLECTION).updateOne({_id: updateID}, {
                $set:{
                    name:proDetails.name,
                    category:proDetails.category,
                    description:proDetails.description
                }
            }).then((_response)=>{
                resolve()
            })
        })

    },

    doLogin: (userData) => {
        return new Promise(async(resolve, _reject) => {
        let adminLogginError=false
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
getAllOrders:()=>{
    return new Promise ( async(resolve, _reject)=>{
        let allOrders = await db.get().collection(collections.ORDER_COLLECTION)
        .find({})
        .toArray()
        console.log("ALL ORDERS OBJECT+++++++++++++++++++++++++",allOrders,"+++++++++++++++++++++++++ALL ORDERS OBJECT")
        resolve(allOrders)
    })
},
getAllUsers:()=>{
    return new Promise ( async(resolve, _reject)=>{
        let allUsers = await db.get().collection(collections.USER_COLLECTION)
        .find({})
        .toArray()
        resolve(allUsers)
    })
}


}
