const { date } = require("joi");
const mongoose=require("mongoose");

const reviewSchema=new mongoose.Schema({
  comment:String,
  rating:{
    type:Number,
    default:3,
    min:1,
    max:5
  },
  created_At:{
    type:Date,
    default: Date.now()
  }
})

const Review=mongoose.model("Review", reviewSchema);

module.exports=Review;