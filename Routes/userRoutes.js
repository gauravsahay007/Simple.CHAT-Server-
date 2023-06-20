//importing express module
var express = require("express");
const { getUserById,signUp, signIn, storeNotification, getNotifications, removeNotification, allUser, isSignedIn, getUser} = require("../Controllers/User");
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
router.param("userId",getUserById);
               
//routes for signin user
router.post("/login",signIn);
router.put("/storenotification",isSignedIn,storeNotification);
router.get("/getnotification/:userId",isSignedIn,getNotifications);
router.put("/deletenotification",isSignedIn,removeNotification);
router.get("/:userId",allUser);



module.exports = router;

 