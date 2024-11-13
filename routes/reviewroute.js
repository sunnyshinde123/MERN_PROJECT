const express=require("express");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const mongoose=require("mongoose");
const {reviewSchema}=require("../utils/review.js");


const router=express.Router({mergeParams:true});

const reviewValidation=(req, res, next)=>{
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errMesg=error.details.map((el) => el.message).join(",");
    next(new ExpressError(400, errMesg));
  }else{
    next();
  }
}

//Review Routes
router.post("/",reviewValidation,wrapAsync(async(req, res)=>{
  let {id}=req.params;
  let {review}=req.body;
  let getListing=await Listing.findById(id);
  let newReview=new Review(review);
  getListing.reviews.push(newReview);
  await newReview.save();
  await getListing.save();
  res.redirect(`/listings/${id}`);
}))


router.delete("/:reviewId", async(req, res, next)=>{
  let {id, reviewId}=req.params;
  let getDeletReview=await Review.findByIdAndDelete(reviewId, {new:true});
  console.log(getDeletReview);
  let getListingUpdate=await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  res.redirect(`/listings/${id}`);
  console.log(getDeletReview);
})

module.exports=router;