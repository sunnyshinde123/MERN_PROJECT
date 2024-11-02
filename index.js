const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError=require("./ExpressError.js");
const wrapAsync=require("./utils/wrapAsync.js");
const {listingSchema}=require("./utils/schema.js");

const app=express();
const port=7080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride('_method'));
app.engine('ejs', engine);

main().then(()=>{
  console.log("DB Connected Successfully");
}).catch(er=> console.log(er));

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlustweb");
}

app.listen(port, ()=>{
  console.log("Server Listening Successfully");
})

const listingValidation=(req, res, next)=>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMesg=error.details.map((el) => el.message).join(",");
    next(new ExpressError(400, errMesg));
  }else{
    next();
  }
}

// app.use((req, res, next)=>{
//   req.responseTime=new Date(Date.now()).toString();
//   console.log(req.method, req.path, req.hostname, req.responseTime);
//   next();
// })

app.get("/", (req, res)=>{
  res.send("Welcome to wonderlust");
})

// app.use("/listings", (req, res, next)=>{
//   let {token} =req.query;
//   console.log(token);
//   if(token==='go'){
//     return next();
//   }
//   throw new ExpressError(404,"ACCESS DENIED");
// })

// app.get("/err", (req, res)=>{
//   abcd=abcd;
// })

// app.get("/testList", async(req, res)=>{
//   let list=new Listing({
//     title:"My Villa",
//     description:"My Beach Day",
//     price:1200,
//     location:"Pune",
//     country:"India"
//   })

//   await list.save();
//   res.send("Listing Saved");
// })

//index route
app.get("/listings", async(req, res)=>{
  let listing=await Listing.find({});
  res.render("listing/index.ejs", {listing});
})

//New Listing Route
app.get("/listings/new", (req, res)=>{
  res.render("listing/new.ejs");
})


//show route
app.get("/listings/:id",wrapAsync(async(req, res, next)=>{
  let {id}=req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing id format"));
  }

  let listing=await Listing.findById(id);
  console.log(listing);
  if(!listing){
    throw new ExpressError(404, "listing id does not exists");
  }
  res.render("listing/show.ejs", {listing});
}));

//Create Route
app.post("/listings", listingValidation, wrapAsync(async(req, res, next)=>{
  let {listing}=req.body;
let newListing=new Listing(listing);
await newListing.save();
console.log(listing);
res.redirect("/listings");

}))

//Edit Listing
app.get("/listings/:id/edit", async(req, res)=>{
  let {id}=req.params;
  let data=await Listing.findById(id);
  res.render("listing/edit.ejs", {data});
})

//Update Route
app.patch("/listings/:id", async(req, res)=>{
  let {id}=req.params;
  let {listing}=req.body;
  let updatedData=await Listing.findByIdAndUpdate(id, listing, {new:true});
  res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id", async(req, res)=>{
  let {id}=req.params;
  let result=await Listing.findByIdAndDelete(id)
  console.log(result);
  res.redirect("/listings");
})

app.all("*", (err, req, res, next)=>{
  next(err);
})

app.use((err, req, res, next)=>{
  let {status=300, message}=err;
  console.log("*******")
  console.log(message);
  res.status(status).render("listing/error.ejs", {message});
})



