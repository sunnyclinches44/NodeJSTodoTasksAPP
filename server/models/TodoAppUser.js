const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var TodoAppUserSchema = new mongoose.Schema({
    email:{
        type: String,
        minlength: 1,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        minlength: 6,
        require: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

TodoAppUserSchema.pre('save', function (next) {
    
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
    
});

TodoAppUserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}

TodoAppUserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access: 'auth'},'abc123').toString();
    user.tokens = user.tokens.concat([{access, token}]);

   return user.save().then(() => {
        return token;
    });
};

TodoAppUserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.updateOne({
        $pull: {
            tokens: {token}
        }
    });
};


TodoAppUserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'abc123');
    } catch(e) {
        return Promise.reject();
    }
    return  User.findOne({
            '_id': decoded._id,
            'tokens.token': token,
            'tokens.access': 'auth'
        });
};

// Method to find user with email and password parameters

TodoAppUserSchema.statics.findByEmailAndPassword = function (email, password) {
    
    var TodoAppUser = this;
    
    return TodoAppUser.findOne({email}).then((user) => {
        
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            var hashedPWD = user.password;
            bcrypt.compare(password, hashedPWD, (err, res) => {
                console.log(`provided password ${password} and hashed password ${hashedPWD} result: ${res}`);
                if(res) {
                    return resolve(user);
                } else {
                    return reject(err);
                }
            });
        });
    }); 
}

var TodoAppUser = mongoose.model('TodoAppUser', TodoAppUserSchema);

module.exports = {
    TodoAppUser
};