const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../ExpressError.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const passport = require("passport");
const {saveRedirectUrl}=require("../utils/middleware.js");

const router = express();

router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({
        username,
        email,
      });
      let registeredUser=await User.register(newUser, password);
      req.login(registeredUser, (err)=>{
        if(err){
          return next(err)
        }
        req.flash("success", "Welcome back to Wanderlust!");
        res.redirect("/listings");
      })
    } catch (e) {
      req.flash("error", `${e.message} please login!`);
      res.redirect("/login");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome to Wanderlust!");
    let url= res.locals.redirectUrl ? res.locals.redirectUrl : "/listings"
    res.redirect(url);
    console.log(req.user);
  }
);

router.get("/logout", (req, res, next)=>{
  req.logOut((err)=>{
    if(err){
      return next(err)
    }
    req.flash("success", "logged you out!");
    res.redirect("/listings");
  })
})

module.exports = router;
