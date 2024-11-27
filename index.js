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
const session = require('express-session');
const flash = require('connect-flash');
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/User.js");
const userRouter=require("./routes/userroute.js");


const app=express();
const port=7080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride('_method'));
app.use(flash());
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
  saveUninitialized:false,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.currUser=req.user;
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

app.get("/", (req, res)=>{
  res.send("Welcome to wonderlust");
})

app.get("/demouser", async(req, res)=>{
  const fakeUser=new User({
    email:"sunnyshinde157@gmail.com",
    username:"SunnyShinde"
  });

  await User.register(fakeUser, "Devops@2001");
  res.send("Thanks for login");
});

app.use("/", userRouter);

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





