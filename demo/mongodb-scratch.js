db.rideshares.find({ _id: ObjectId("535351c78f260ddf19b8219a"), "messages": {$elemMatch: {"from": "AAA", "to": "DDD" }} }, {"messages": true})
db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a")}, { $push: {"messages": msg} })

db.rideshares.find({_id: ObjectId("535351c78f260ddf19b8219a")})

db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a")}, {$pop: {"messages": 1}})

db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a")}, { $push: {"messages": {"from": "AAA", "to": "BBB"}} })
db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a")}, { $push: {"messages": {"from": "CCC", "to": "DDD"}} })
db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a")}, { $push: {"messages": {"from": "CCC", "to": "EEE"}} })

db.rideshares.find({_id: ObjectId("5353546379d243981aed0d97")}, {"messages": true})
db.rideshares.find({_id: ObjectId("535351c78f260ddf19b8219a")}, {"_id": false, "messages": true})

db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a"), "messages.from": {$ne: "BBB"}}, { $push: {"messages": {"from": "BBB", "to": "CCC"}} })

db.rideshares.update({_id: ObjectId("535351c78f260ddf19b8219a"), "messages.from": {$ne: "BBB"}}, { $push: {"messages": {"from": "BBB", "to": "CCC"}} })

db.rideshares.find({ _id: ObjectId("535351c78f260ddf19b8219a"), "messages": {$elemMatch: {"from": "AAA", "to": "CCC" }} }, {"messages": true})

db.rideshares.find({ _id: ObjectId("535351c78f260ddf19b8219a"), "messages": {$elemMatch: {"from": "AAA", "to": "DDD" }} }, {"messages": true})

db.rideshares.update(
  {
    $and: [
      {_id: ObjectId("535351c78f260ddf19b8219a")},
      {"messages": { $elemMatch: {"from": {$ne: "AAA"}, "to": {$ne: "DDD"} }}}
    ]
  },
  { $push: {"messages": {"from": "AAA", "to": "DDD"}} }
)

db.rideshares.find({ _id: ObjectId("535351c78f260ddf19b8219a"), "messages": { $elemMatch: {"from": {$ne: "AAA"}, "to": {$ne: "DDD"}}} })

db.rideshares.find({ _id: ObjectId("535351c78f260ddf19b8219a"), "messages.from": {$ne: "AAA"}, "messages.to": {$ne: "DDD"} })


db.rideshares.find({_id: ObjectId("535353218f260ddf19b8219e")}, {"messages": true}).pretty()
db.rideshares.find(
  {
    _id: ObjectId("535353218f260ddf19b8219e"),
    "messages": { $elemMatch: {"userIdFrom": ObjectId("5343affe9db223f3710dda13")}}
  },
  {"messages": true}
).pretty()

db.rideshares.find({_id: ObjectId("539be8acf96709e25db8752c")}, {"messages": true}).pretty()
db.rideshares.find(
  {
    _id: ObjectId("539be8acf96709e25db8752c"),
    "messages": { $elemMatch: {"userIdFrom": ObjectId("5343affe9db223f3710dda13")}}
  },
  {"messages": true}
).pretty()

db.rideshares.update(
  {
    _id: ObjectId("539be8acf96709e25db8752c"),
    "messages": { $elemMatch: {"userIdFrom": ObjectId("5343affe9db223f3710dda13")}}
  },
  {$set: {"messages.$.message": "yada yada"}}
)

db.rideshares.update(
  {
    _id: ObjectId("539be8acf96709e25db8752c"),
    "messages": { $elemMatch: {"userIdFrom": ObjectId("5343affe9db223f3710dda13")}}
  },
  {$push: {"messages.$.responses": {status: 'sent'}}}
)

db.rideshares.update(
  {
    _id: ObjectId("539be8acf96709e25db8752c"),
    "messages": { $elemMatch: {"userIdFrom": ObjectId("5343affe9db223f3710dda13")}}
  },
  {$push: {"messages.$.responses": {email: 'recipient.email@example.com', status: 'sent', _id: 'abc123abc123abc123abc123abc123', reject_reason: null}}}
)


// Remove all messages
// Leave empty messages array
db.rideshares.update({}, { $set : {'messages': [] }} , {multi:true} )
// Remove the messages property
db.rideshares.update({}, { $unset : {'messages': '' }} , {multi:true} )

/*

 https://github.com/dschenkelman/mongo-select


 var select = require('mongo-select').select();
 var mongodb = require('mongodb');

 var MongoClient = mongodb.MongoClient;

 MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
 if(err) throw err;

 var users = db.collection('users');
 scripts = users.find({}, select.include(['name', 'email']),
 function(err, result){
 // code here, access to only result[i]._id, result[i].name and result[i].email
 });
 });


 var select = require('mongo-select').select();
 var projection = select.include(['name', 'email', 'children.name']).make();
 console.log(projection); // { 'name': false, 'email': false, 'children.name': false };

 */

db.rideshares.find({}, {"itinerary.route.place": true}).limit(1).sort({created_at:-1}).pretty();
