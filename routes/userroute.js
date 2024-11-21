const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../ExpressError.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

const router=express();

router.get("/signup", (req, res)=>{
  res.render("user/signup.ejs");
});

router.post("/signup", async(req, res)=>{
  let {username, email, password}=req.body;
  const newUser=new User({
    username,
    email
  })
  await User.register(newUser, password);
  res.redirect("/listings");
});

module.exports=router;