var db = require("../config/connection");
var userCollection = require("../config/collections");

const bcrypt = require("bcrypt"); // Import the bcrypt library

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
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection('user')
        .insertOne(userData).then((result) => {
          //  resolve(result.ops[0]);
        })
    });
  },

    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
        let loginStatus = false;
        let responce={}
        let user= await db.get().collection('user').findOne({Email :userData.Email});
        if(user) {
            const result = await bcrypt.compare(userData.Password, user.Password)
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
