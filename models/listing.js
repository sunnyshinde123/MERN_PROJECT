const mongoose=require("mongoose");

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
      type:String
    }
  },
  price:{
    type:Number,
  },
  location:String,
  country:String
});

const Listing=mongoose.model('Listing', listingSchema);

module.exports=Listing;