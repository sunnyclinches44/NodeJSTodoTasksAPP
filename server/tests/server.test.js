const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

const {app} = require('./../server');
var {TodoTask} = require('./../models/TodoTask');
var {TodoAppUser} = require('./../models/TodoAppUser');

//Hook before each test case execution
beforeEach(populateUsers);
beforeEach(populateTodos);


describe('Test cases for post /todos method of Todo App', () => {
    
//     // Successful scenario to create a todo task
    it('Should create a todo task', (done) => {
        var todoTask = 'Todo task added from the supertest';
    
        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({todoTask})
        .expect(200)
        .expect((res) => {
            expect(res.body.todoTask).toBe(todoTask);
        })
        .end((err, res) => {
            if (err) {
                console.log(`Error as part of test case: ${JSON.stringify(err, undefined, 2)}`);
                return done(err);
            }
            
            TodoTask.find({todoTask}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].todoTask).toBe(todoTask);
                done(); 
            }).catch((e) => done(e));
        });
    });

//     // Failure test case not to create a todo task
//     it('Should not create a todo task', (done) => {
//         var todoTask = '';

//         request(app)
//         .post('/todos')
//         .send({todoTask})
//         .expect(400)
//         .end((err, res) => {
//             if(err){
//                 console.log(`Error as part of the test case: ${JSON.stringify(err, undefined, 2)}`);
//                 return done(err);
//             }

//             TodoTask.find().then((todos) => {
//                 expect(todos.length).toBe(2);
//                 done();
//               }).catch((e) => done(e));
//         });
//     });

});


// GET /todos test cases

describe('GET /todos test cases', () => {

    it('Should return all todo tasks', (done) => {

        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

//GET /todos/:id test cases

describe('GET /todos/:id test cases', () => {

    // Should get a valid todo task
    it('Should get a valid todo task', (done) => {

        var id = todos[0]._id.toHexString();

        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.todoTask).toBe(todos[0].todoTask);
            })
            .end(done);
    });

    // Should not return a valid todo task
    it('Should not return a valid todo task', (done) => {

        request(app)
            .get(`/todos/1234532`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    // HexID is not present scenario
    it('HexID is not present scenario',(done) => {

        var hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('Delete method /todos/:id test cases', () => {

    it('Should delete a todo task', (done) => {
        
        var id = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.todoTask).toBe(todos[0].todoTask);
        })
        .end(done);

    });
});

describe('Todo app Patch /todos/id method test', () => {
    it('Should patch an existing task', (done) => {
        
        var body = {
            status: "completed",
            todoTask: "Updated the supertest task"
        }

        request(app)
        .patch(`/todos/${todos[0]._id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.todoTask).toBe(body.todoTask);
            expect(res.body.todo.status).toBe("completed");
            expect(res.body.todo.completedAt).toExist;
        }).end(done);
    });

    it('Invalid ID test case', (done) => {
        request(app)
         .patch('/todos/1234532')
         .set('x-auth', users[0].tokens[0].token)
         .send()
         .expect(404)
         .expect((res) => {
            expect(res.body.errorMessage).toExist;
         }).end(done);
    });
});

describe('GET /users/me test cases', () => {
    
    it('Should return user if authenticated', (done) => {
       
        request(app)
         .get('/users/me')
         .set('x-auth',users[0].tokens[0].token)
         .expect(200)
         .expect((res) => {
            expect(res.body.email).toBe('test1@test.com');
         })
         .end(done);
    });

    it('Should return 401 user authenticated', (done) => {

        request(app)
         .get('/users/me')
         .set('x-auth','32432432432432')
         .expect(400)
         .expect((res) => {
            expect(res.body).toEqual({});
         })
         .end(done);
    });
});

describe('POST /users test cases', () => {
    it('Should create a user', (done) => {
        
        var user = {
            email: 'testexample@test.com',
            password: 'examplepass'
        };

        request(app)
         .post('/users')
         .send(user)
         .expect(200)
         .expect((res) => {
            expect(res.body).toExist;
         })
         .end(done);
    });

    it('Should throw a validation error', (done) => {

        var user = {
            email: 'testdasdsa',
            password: '32321'
        };

        request(app)
         .post('/users')
         .send(user)
         .expect(400)
         .end(done);
    });

    it('Should throw a validation error if email is already in use', (done) => {
        var user = {
           email: 'test1@test.com',
           password: '321321'
        };

        request(app)
         .post('/users')
         .send(user)
         .expect(400)
         .end(done);
    });
});

describe('POST /users/login method test cases', () => {

    it('Should authenticate a user with valid email and password', (done) => {
        request(app)
         .post('/users/login')
         .send({
             email: users[1].email,
             password: users[1].password
         })
         .expect(200)
         .expect((res) => {
            expect(res.headers['x-auth']).toExist;
         })
         .end(done);
    });

    it('Should not authenticate the user if password is not valid', (done) => {
        request(app)
         .post('/users/login')
         .send({
             email: users[1].email,
             password: 'invalidpassword'
         })
         .expect(401)
         .expect((res) => {
            expect(res.body.errorMessage).toExist;
         })
         .end(done);
    });
});

describe('DELETE /users/me test cases', () => {
    it('Should delete the token of the user', (done) => {
        request(app)
         .delete('/users/me')
         .set('x-auth', users[0].tokens[0].token)
         .send()
         .expect(200)
         .expect((res) => {
            expect(res.body).toEqual({});
         })
         .end((err, res) => {
            TodoAppUser.findById(users[0]._id).then((user)=> {
                if(!user){
                    done(err);
                }
                expect(user.tokens.length).toBe(0);
                done(err);
            });
         });
    });

    it('Should throw a validation error if token is invalid', (done) => {
        request(app)
         .delete('/users/me')
         .set('x-auth', '323213213')
         .send()
         .expect(400)
         .end(done);
    });
});