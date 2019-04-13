const {TodoAppUser} = require('../models/TodoAppUser');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    TodoAppUser.findByToken(token).then((user) => {
        if (!user){
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(400).send();
    });
};

module.exports = {
    authenticate
}