const mongoose=require("mongoose");
const Review = require("./review");
const User=require("./User");

const dbHost = process.env.DB_HOST || "localhost";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "admin";
const dbName = process.env.DB_DATABASE || "wanderlustweb";

/* const mongoURI = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`;*/
const mongoURI = `mongodb://127.0.0.1:27017/wanderlustweb`

main()
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoURI);
}


const listingSchema=new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:String,
  image:{
    url:{
      type:String,
      default:"https://plus.unsplash.com/premium_photo-1661915661139-5b6a4e4a6fcc?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    filename:{
      type:String,
      default:"listingimage"
    }
  },
  price:{
    type:Number,
  },
  location:String,
  country:String,
  reviews:[
    {type:mongoose.Schema.Types.ObjectId, ref:Review}
  ],
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref: User
  }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing.reviews.length){
    await Review.deleteMany({_id: {$in: listing.reviews}})
  }
})

const Listing=mongoose.model('Listing', listingSchema);

module.exports=Listing;
