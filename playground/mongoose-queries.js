const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {TodoTask} = require('./../server/models/TodoTask');

var id = '5bf92b2dffff047114360b6e';

if(!ObjectID.isValid(id)){
    return console.log(`Provided ID is not valid ${id}`);
}

//find method that returns array of todos

// TodoTask.find({
//     _id: id
// }).then((res) => {
//     console.log(`Successfully retrieved the todo documents: ${JSON.stringify(res, undefined, 2)}`);
// }).catch((e) => {
//     console.log(e);
// });

//findOne method that returns a first match object

// TodoTask.findOne({
//     _id: id
// }).then((res) => {
//     console.log(`Successfully retrieved the todo document: ${JSON.stringify(res, undefined, 2)}`);
// }).catch((e) => {
//     console.log(e);
// });

// findById method that returns a object matched with id

TodoTask.findById(id).then((res) => {
    if(!res){
        return console.log('Unable to find document');
    }
    console.log(`Successfully retrieved the document by Id: ${JSON.stringify(res, undefined, 2)}`);
}).catch((e) => console.log(e));