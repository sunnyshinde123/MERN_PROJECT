const Listing = require("../models/listing.js");
const {reviewSchema}=require("../utils/review.js");
const {listingSchema}=require("../utils/schema.js")
const Review = require("../models/review.js");


module.exports.isLoggedIn=(req, res, next)=>{
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error", "you must be logged in!");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req, res, next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner=async(req, res, next)=>{
  let { id } = req.params;
  const listing=await Listing.findById(id);
  if(!res.locals.currUser._id.equals(listing.owner._id)){
    req.flash("error", "you are not the owner of this Listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();

};

module.exports.isReviewAuthor=async(req, res, next)=>{
  let {id, reviewId}=req.params;
  let getDeletReview=await Review.findById(reviewId);
  if(!getDeletReview.author._id.equals(res.locals.currUser._id)){
    req.flash("error", "you are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.listingValidation = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMesg = error.details.map((el) => el.message).join(",");
    next(new ExpressError(400, errMesg));
  } else {
    next();
  }
};

module.exports.reviewValidation=(req, res, next)=>{
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errMesg=error.details.map((el) => el.message).join(",");
    next(new ExpressError(400, errMesg));
  }else{
    next();
  }
}