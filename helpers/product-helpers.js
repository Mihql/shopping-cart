var db = require('../config/connection')
var productCollection = require('../config/collections')
module.exports={

    addProduct:(product, callback)=>{
        
        db.get().collection('product').insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async (resolve, reject)=>{
            let products =await db.get().collection(productCollection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}
