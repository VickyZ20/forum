const mongoClient = require("../config/mongoClient");
const User = require("../models/user");

// only read active users
// don't return password field
const readUsers = () => {
  return new Promise((resolve, reject) => {
    // Get database
    // Set the table to user
    // Find all users but exclude the following fields: _id (mongoDb generated id), hashed_password
    // Convert the data to array
    // Check if we have a successful response
    // If we have error we will return an error response
    mongoClient
      .getDatabase()
      .connection.collection("user")
      .find({}, { projection: { _id: 0, hashed_password: 0 } })
      .toArray((err, docs) => {
        if (err) {
          console.error("error: readUsers", err);
          reject("Failed to get all users from database");
        } else {
          resolve(docs);
        }
      });
  });
};

// only read active users
// don't return password field
const readUser = (doc) => {
  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("user")
      .find(Object.assign({ active: 1 }, doc), {
        projection: { _id: 0, hashed_password: 0 },
      })
      .toArray((err, docs) => {
        if (err) {
          console.error("error: readUser", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const addUser = (doc) => {
  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("user")
      .insertOne(Object.assign({ active: 1 }, doc))
      .then((result, err) => {
        if (err) {
          console.error("error: addUser", err);
          reject("Failed to add user to database");
        } else {
          // The mongo success result is on the following data structure
          // result.ops: this is an array
          if (result.ops && result.ops.length && result.ops.length > 0) {
            // Create user of result and remove password
            const user = User.from(result.ops[0]);
            // remove password before sending back
            user.hashed_password = undefined;
            // Return inserted user
            resolve(user);
          } else {
            resolve(undefined);
          }
        }
      });
  });
};


/*
  location: structure to recognize the data to update on for example id
  updateValue: json structure to update
  Example of updateValue: { $set: { test2: 2 } }
*/
const updateUser = (location, updateValue) => {
  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("user")
      .updateOne(location, updateValue)
      .then((result, err) => {
        if (err) {
          console.error("error: updateUser", err);
        }
        if (result.result.ok && result.result.ok > 0) {
          resolve(result);
        } else {
          reject();
        }
      });
  });
};

// We will never delete a user/post just set the account to not active
const deleteUser = (location) => {
  return new Promise((resolve, reject) => {
    updateUser(location, { $set: { active: 0 } })
      .then(resolve)
      .catch(reject);
  });
};

// Real delete for development only
const deleteDocument = () => {};

// Export all database functions
module.exports = {
  readUsers,
  addUser,
  updateUser,
  readUser,
  deleteUser,
};

// Example database function for user table
/*
const test = async () => {

  // init connection
  await mongoClient.initConnection();

  // read entire table
  const before = await userController.readUsers();
  console.log("Users before insert", JSON.stringify(before));

  // insert new in table
  const insert = await userController.addUser({ test: "emile3" });
  console.log("User after insert", JSON.stringify(insert));

  // read entire table
  const after = await userController.readUsers();
  console.log("Users after insert", JSON.stringify(after));

  // update new user
  const update = await userController.updateUser(
    { test: "emile3" },
    { $set: { test2: 2 } }
  );
  console.log("after update", JSON.stringify(update));

  // read entire table
  const read = await userController.readUsers();
  console.log("Users after update", JSON.stringify(read));

  // get single user
  const single = await userController.readUsers({ test: "emile3" });
  console.log("User after", JSON.stringify(single));

  // delete single user
  const deleteUser = await userController.deleteUser({ test: "emile3" });
  console.log("User delete after", JSON.stringify(deleteUser));

};
*/
