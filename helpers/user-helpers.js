var db = require('../config/connection')
const collections = require('../config/collections')

const bcrypt = require('bcrypt')

module.exports={
    doSignup: (userData) => {
        return new Promise(async(resolve, reject) => {
        userData.password =await bcrypt.hash(userData.password, 10)
         db.get().collections(collections.USER_COLLECTION).insertOne(userData).resolve(data.ops[0])
        })
    }

}