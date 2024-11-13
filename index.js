const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError=require("./ExpressError.js");
const wrapAsync=require("./utils/wrapAsync.js");
const {listingSchema}=require("./utils/schema.js");
const {reviewSchema}=require("./utils/review.js");
const Review=require("./models/review.js");
const listingRouter=require("./routes/listingroute.js");
const reviewRouter=require("./routes/reviewroute.js");
const session = require('express-session')

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

app.use(session({
  secret:"mysecret",
  resave:true,
  saveUninitialized:false
}))

app.get("/", (req, res)=>{
  res.send("Welcome to wonderlust");
})


app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);


app.all("*", (err, req, res, next)=>{
  next(err);
})

app.use((err, req, res, next)=>{
  let {status=300, message}=err;
  console.log("*******")
  console.log(message);
  res.status(status).render("listing/error.ejs", {message});
})





