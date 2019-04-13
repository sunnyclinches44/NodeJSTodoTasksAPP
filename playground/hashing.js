const {SHA256} = require('crypto-js');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var password = '3213213';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(`Hashed value of the password ${hash}`);
    });
});

var hashedPwd ='$2a$10$XvyqHaVoKfRAcXiJ81toPO/cH/gYFOsb7lDMGbp9Xt4LQAZaJVpYq';

bcrypt.compare(password, hashedPwd, (err, res) => {
    console.log(res);
});

var token = jwt.sign({id: 4}, 'somesecret');

console.log(`Generated token: ${token}`);
try{
    jwt.verify(token, 'somesecret');
    console.log('Token verified');
}catch (err) {
    console.log('Token not verified or data manipulated');
}

// var message = 'Testing SHA256 message';
// var hashedMessage = SHA256(message);

// console.log (`Message: ${message}`);
// console.log(`Hashed Message: ${hashedMessage}`);

// var data = {
//     id: 4
// };

// var token = {
//     data, 
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// //token.data.id = 5;

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash){
//     console.log('data not manipulated')
// }else{
//     console.log('data manipulated')
// }