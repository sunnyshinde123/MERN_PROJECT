const express=require("express");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../ExpressError.js");
const Listing=require("../models/listing.js");
const mongoose=require("mongoose");
const {listingSchema}=require("../utils/schema.js");


const router=express.Router();

const listingValidation=(req, res, next)=>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMesg=error.details.map((el) => el.message).join(",");
    next(new ExpressError(400, errMesg));
  }else{
    next();
  }
}

//index route
router.get("/", async(req, res)=>{
  let listing=await Listing.find({});
  res.render("listing/index.ejs", {listing});
})

//New Listing Route
router.get("/new", (req, res)=>{
  res.render("listing/new.ejs");
})


//show route
router.get("/:id",wrapAsync(async(req, res, next)=>{
  let {id}=req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing id format"));
  }

  let listing=await Listing.findById(id).populate("reviews");
  console.log(listing);
  if(!listing){
    throw new ExpressError(404, "listing id does not exists");
  }
  res.render("listing/show.ejs", {listing});
}));

//Create Route
router.post("/", listingValidation, wrapAsync(async(req, res, next)=>{
  let {listing}=req.body;
  console.log(listing);
let newListing=new Listing(listing);
await newListing.save();
res.redirect("/listings");

}))

//Edit Listing
router.get("/:id/edit", async(req, res)=>{
  let {id}=req.params;
  let data=await Listing.findById(id);
  res.render("listing/edit.ejs", {data});
})

//Update Route
router.patch("/:id", async(req, res)=>{
  let {id}=req.params;
  let {listing}=req.body;
  let updatedData=await Listing.findByIdAndUpdate(id, listing, {new:true});
  res.redirect(`/listings/${id}`);
})

//Delete Route
router.delete("/:id", async(req, res)=>{
  let {id}=req.params;
  let result=await Listing.findByIdAndDelete(id)
  res.redirect("/listings");
})

module.exports=router;