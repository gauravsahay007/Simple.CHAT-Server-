//importing express module
var express = require("express");
const { signUp, signIn, storeNotification, getNotifications, removeNotification, allUser, isSignedIn} = require("../Controllers/User");
const {check, validationResult} = require('express-validator');
var router = express.Router();
//routes for register user or signup user
router.post("/signup",[
    check("name","name should be atleast 3 char").isLength({min : 3}),
  
    check("email","email is required").isEmail(),
  
    check("password","password should be at least 3 char").isLength({min:3})
  
     ],
     signUp
)
//routes for signin user
router.post("/login",signIn);
router.post("/storenotification",isSignedIn,storeNotification);
router.get("/getnotification",isSignedIn,getNotifications);
router.put("/deletenotification",isSignedIn,removeNotification);
router.get("/:userId",isSignedIn,allUser);

module.exports = router;

