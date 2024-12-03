const express=require("express");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const mongoose=require("mongoose");
const {reviewSchema}=require("../utils/review.js");
const {isLoggedIn, reviewValidation, isReviewAuthor}=require("../utils/middleware.js");

const router=express.Router({mergeParams:true});



//Review Routes
router.post("/", isLoggedIn, reviewValidation,wrapAsync(async(req, res)=>{
  let {id}=req.params;
  let {review}=req.body;
  let getListing=await Listing.findById(id);
  let newReview=new Review(review);
  newReview.author=req.user._id;
  getListing.reviews.push(newReview);
  await newReview.save();
  await getListing.save();
  req.flash("success", "Review Added Successfully");
  res.redirect(`/listings/${id}`);
}))


router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async(req, res, next)=>{
  let {id, reviewId}=req.params;
  let getDeletReview=await Review.findByIdAndDelete(reviewId, {new:true});
  console.log(getDeletReview);
  let getListingUpdate=await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  req.flash("success", "Review Deleted Successfully");
  res.redirect(`/listings/${id}`);
}))

module.exports=router;