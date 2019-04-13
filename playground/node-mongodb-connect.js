
//const MongoClient = require('mongodb').MongoClient;

const {MongoClient, ObjectID} = require('mongodb');

var _id = new ObjectID();

console.log(_id.getTimestamp());
const url = 'mongodb+srv://PostAppAdminUser:bORcG58Qu3whZl2V@cluster0-xgobp.mongodb.net';

// insert documents
const insertDocuments = (db, callback) => {
    // Get the documents collection
    const collection = db.collection('TodoTasks');

    // Insert some documents
    collection.insertMany([{
        _id: _id,
        firstName: 'Node User 1',
        lastName: 'Testing Node User 1',
        Task: 'Learn node js completely',
        status: 'Completed'
    }], (err, result) => {
        if(err){
            console.log(`Mongo DB Insertion failed with error ${JSON.stringify(err, null, 2)}`);
        }
        callback(result);
    });
};

// Fetch documents 
const fetchDocuments = (db, callback) => {
    // Get the documents collection
    const collection = db.collection('TodoTasks');

    // use find method to getch documents
    collection.find({status: 'In progress'}).toArray().then((res) => {
        callback(res);
    }, (err) => {
        console.log(`Unable to fetch the documents: ${JSON.stringify(err, undefined, 2)}`);
    })
};

const countOfDocuments = (db, callback) => {
    // Get the documents collection
    const collection = db.collection('TodoTasks');

    collection.countDocuments().then((res) => {
        callback(res);
    }, (err) => {
        console.log(`Unable to get the count of documents: ${JSON.stringify(err, undefined, 2)}`);
    })
};

const deleteManyDocuments = (db, callback) => {
    // Delete Many Documents 
    const collection = db.collection('TodoTasks');

    collection.deleteMany({status: 'Completed'}).then( (res) => {
        callback(res);
    }).catch( (err) => {
        console.log(`Unable to delete the documents with mentioned criteria ${JSON.stringify(err, undefined, 2)}`);
    });
};

const findOneAndDeleteDocument = (db, callback) => {
    // Use find one and delete method
    const collection = db.collection('TodoTasks');

    collection.findOneAndDelete({_id: new ObjectID('5bf52be50d7cbd4734940d0f')}).then((result) => {
        callback(result);
    }). catch((err) => {
        console.log(`Unable to delete the document: ${JSON.stringify(err, undefined, 2)}`)
    });
};

const findOneAndUpdateDocument = (db, callback) => {
    // Use find one and update document
    const collection = db.collection('TodoTasks');

    debugger;
    
    collection.findOneAndUpdate({
        _id: new ObjectID('5bf5ffe01c9d440000b3ad69')
    },{
        // $set: {
        //     status: 'Completed',
        //     age: 25
        // }
        $inc: {
            age: 1
        }
    },{
        returnOriginal: false
    }).then((result) => {
        callback(result);
    }). catch((err) => {
        console.log(`Unable to update the document: ${JSON.stringify(err, undefined, 2)}`)
    });
};

//Use connect method to connect to the server
MongoClient.connect( url ,{ useNewUrlParser: true }).then((database) => {
    
    console.log(`Successfully connected to the cloud mongodb database: ${database}`);

    const db = database.db('TestTodoApp');
    
    // Insert documents
    // insertDocuments(db, (result) => {
    //     if(result){
    //         console.log(`documents added to mongodb successfully ${JSON.stringify(result, null, 2)}`);
    //     }
    // });

    //Fetch documents
    // fetchDocuments(db, (res) => {
    //     if (res){
    //         console.log(`Fetched the records ${JSON.stringify(res, undefined, 2)}`);
    //     }
    // });

    // Count of documents
    // countOfDocuments(db, (res) =>{
    //     if (res){
    //         console.log(`No of fetched documents: ${JSON.stringify(res, undefined, 2)}`);
    //     }
    // });

    //delete many documents
    // deleteManyDocuments(db, (res) => {
    //     if (res) {
    //         console.log(`Successfully deleted the documents: ${JSON.stringify(res, undefined, 2)}`);
    //     }
    // })

    //find one and delete document
    // findOneAndDeleteDocument(db, (res) => {
    //     if (res){
    //         console.log(`Successfully deleted the document ${JSON.stringify(res, undefined, 2)}`);
    //     }
    // });

    //find one and update document
    findOneAndUpdateDocument(db, (res) => {
        if (res) {
            console.log(`Successfully updated the document: ${JSON.stringify(res, undefined, 2)}`);
        }
    });
},(err) => {

    if(err){
        return console.log('Unable to connect to the mongodb cloud');
    }
});
