const mongoose=require("mongoose");
const db=require("./init.js");
const Listing=require("../models/listing.js");

// main().then(()=>{
//   console.log("DB Connected Successfully");
// }).catch(er=> console.log(er));



// async function main(){
//   await mongoose.connect("mongodb://127.0.0.1:27017/wanderlustweb");
// }

const dbHost = process.env.DB_HOST || "localhost";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "admin";
const dbName = process.env.DB_DATABASE || "wanderlust";

main()
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(`mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`);
}

const initDB=async ()=>{
  await Listing.deleteMany({});
  await Listing.insertMany(db.newDB);
  console.log("DB Initiated Successfully");
}

initDB();
