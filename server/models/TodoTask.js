const mongoose = require('mongoose');


var TodoTask = mongoose.model('TodoTask', {
    todoTask:{
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completedAt: {
        type: Number,
        default: null
    },
    status:{
        type: String,
        default: 'In progress'
    },
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});


module.exports = {
    TodoTask
};