require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const serverless = require('serverless-http');
const cors = require('cors');
const _ =require('lodash');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose.js');
const {TodoTask} = require('./models/TodoTask.js');
const {TodoAppUser} = require('./models/TodoAppUser.js');
const {authenticate} = require('./middleware/middleware');

const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/todos', authenticate, (req, res) => {
    
    var todoTask = new TodoTask({
        todoTask: req.body.todoTask,
        _creator: req.user._id
    });
    
    todoTask.save().then((doc) => {
        res.status(200).send(doc);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', authenticate, (req, res) => {
    
    //Use TodoTask find method
    TodoTask.find({_creator: req.user._id}).then((todos) => {
        res.status(200).send({todos});
    }).catch((e) => {
        res.status(400).send(e);
    });

});

app.get('/todos/:id', authenticate, (req, res) => {

    var id = req.params.id;
    // Check whether Id is in valid format
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    TodoTask.findOne({_id: id,
    _creator: req.user._id}).then((todo) => {
        // check todo object exists
        if(!todo){
            res.status(404).send();
        }

        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    // Check whether id is in valid format
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    TodoTask.findOneAndDelete({_id: id, 
    _creator: req.user._id}).then((todo) => {
        // check todo object exists 
        if(!todo){
            return res.status(404).send();
        }

        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id',authenticate, (req, res) => {
    var id = req.params.id;

    var body = _.pick(req.body, ['status', 'todoTask']);
    //check whether id is in valid format
    if(!ObjectID.isValid(id)){
        return res.status(404).send({
            errorMessage: "Provided ID is not valid"
        });
    }

    if(body.status !== '' && body.status === 'completed'){
        body.completedAt = new Date().getTime();
    }else {
        body.completedAt = '';
    }

    TodoTask.findOneAndUpdate({_id:id,
    _creator:req.user._id}, {$set: body}, {new: true}).then((todo) => {

        if(!todo){
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((e) => res.status(400).send({
        errorMessage:"Exception as part of findByIdAndUpdateMethod"
    })); 
});

app.post('/users', (req, res) => {

    var body = _.pick(req.body, ['email', 'password']);
    var todoAppUser = new TodoAppUser(body);

    todoAppUser.save().then(() => {
        return todoAppUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token)
        .status(200)
        .send(todoAppUser)
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    var user = req.user;
    res.status(200).send(user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
   
    TodoAppUser.findByEmailAndPassword(body.email, body.password)
        .then((user) => {
            user.generateAuthToken().then((token) => {
                res.header('x-auth', token).status(200).send(user);
            });
        }).catch ((err) => {
            res.status(401).send({
                errorMessage: "User authentication failed"
            });
        });
});

app.delete('/users/me', authenticate, (req, res) => {
    var user = req.user;
    user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(404).send();
    });
});

//module.exports.handler = serverless(app);
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

module.exports = {app};