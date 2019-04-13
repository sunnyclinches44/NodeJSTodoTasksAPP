const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {TodoTask} = require('./../../models/TodoTask');
const {TodoAppUser} = require('./../../models/TodoAppUser');

const testUser1ID = new ObjectID();
const testUser2ID = new ObjectID();

const users = [{
    _id: testUser1ID,
    email: 'test1@test.com',
    password: 'test1Pass',
    tokens: [{
        access: 'auth',
        token : jwt.sign({_id: testUser1ID, access: 'auth'},process.env.JWT_TOKEN).toString()
    }]
}, {
    _id: testUser2ID,
    email: 'test2@test.com',
    password: 'test2Pass'
}];

const todos = [{
    _id: new ObjectID(),
    todoTask: 'Todo task 1 added from test suite',
    _creator: users[0]._id
}, {
    _id: new ObjectID(),
    todoTask: 'Todo task 2 added from test suite',
    _creator: users[1]._id
}];

const populateTodos = (done) => {
    TodoTask.deleteMany().then((res) => {
        return TodoTask.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = (done) => {
    TodoAppUser.deleteMany().then((res) => {
        var userOne = new TodoAppUser(users[0]).save();
        var userTwo = new TodoAppUser(users[1]).save();
        
        return Promise.all([userOne, userTwo]).then(() => {
        })
        .then(() => done())
        .catch('Error saving the users data');
    })
}

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}