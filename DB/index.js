const mongoose=require("mongoose");
const db=require("./init.js");
const Listing=require("../models/listing.js");

main().then(()=>{
  console.log("DB Connected Successfully");
}).catch(er=> console.log(er));

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlustweb");
}

const initDB=async ()=>{
  await Listing.deleteMany({});
  await Listing.insertMany(db.newDB);
  console.log("DB Initiated Successfully");
}

initDB();