const User = require("../Models/User")
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const {check, validationResult} = require("express-validator"); 
const authenticate=require("../Models/User")
const Chat = require("./Chat")
const Message = require("./Message");
exports.signUp = (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            error : errors.array()[0].msg
          });
    }

    const user = new User(req.body);
     user.save().then((user,err) => {
        if(err || !user){
            return res.status(400).json({
                err: "Not able to save user in DATABASE"
            })
        }

        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        })
     })
}

  exports.signIn = (req,res) => {
    const errors = validationResult(req);
    const {email, password} = req.body;

    if(!errors.isEmpty()){
        res.status(422).json({
            errors: errors.array()[0]
        })
    }

    User.findOne({email}).then((user,err)=>{
        if(err){
            res.status(400).json({
                error: "User email doesnot exists"
            })
        }

        if(!user.authenticate(password)){
            return res.status(401).json({
                error: "Email and password donot match"
            })
        }

        const token = jwt.sign({_id: user._id},process.env.SECRET)

        res.cookie("token",token,{expire: new Date()+1})

        const { _id,name,email ,role} = user;
        return res.json({
            token,
            user:{_id,name,email,role}
        }) 
    })
  }

  exports.isSignedIn = expressJwt({
   
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    
    userProperty: "auth"

})

exports.isAuthenticated=(req,res,next)=>{
   
    const check=req.profile && req.auth && req.profile._id==req.auth._id;
    
    if(check==false){
        return res.status(403).json({
            error:"User doesn't exist: Access Denied"
        })
    }
   
    next();
}

exports.getUserById=(req,res,next,id)=>{
    try{
        User.findById(id).then((user,err)=>{
            if(err || !user){
                return res.status(400).json({
                    error:"Oops...There is not any user of this id in the database"
                }); 
                
            }
            req.profile=user;
            next();    
        })
    }
    catch(err){
        console.log("err");
    }
  
};

//req (request) and res (response) representing the incoming request and the outgoing response, respectively
exports.storeNotification=(req,res)=>{
    const {userId,messageId,chatId}=req.body;
    //updates a user document in the database identified by the userId
    const stored=User.findByIdAndUpdate
    (userId,
//$push operator to add a new element which contains the chatId and messageId to the notifications array field of the user document
     {$push : {notifications:{chat: chatId,message:messageId}},},
     {new:true},   
     
        ).then((resp,err)=>{
            if(err){
                res.status(400).json({
                    error:"Notification can't be stored"
                })
            }
            else{
                res.json(resp)
            }
        })
   
}
exports.getNotifications=(req,res)=>{
//extract the id property from the req.params object. 
//It expects the id to be provided as a route parameter.
    const id=req.profile._id;

    var notifications =  User.findById(
        id,
      ) 
       .then((resp,err)=>{
      
           
            console.log(resp);
              res.status(200).json(resp);
        })
    
    

    
}
exports.removeNotification=(req,res)=>{
    const {userId,chatId}=req.body;
    var remove=User
    .findByIdAndUpdate(
        userId,
        {$pull:{notifications:{chatId: chatId}}},
        {new:true }
    )
    .select("notifications")
    .populate("notifications.message",'sender content chat').then((resp,err)=>{
        if(err){
           return res.status(400)
        }
        else{
            return res.json(resp);
        }
    })
}

exports.allUser =  (req, res) => {
    // below is ternary operator if req.query.search exists then code before  : will be executed else after : will be executed
    // so if req.query.search exists then keyword will be regularexpression matching with the query.search and $options: "i" shows that it is case insensitive
    // overall keyword is used to search for matching name or email in the User document
    const keyword = req.query.search ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
      : {};

    //   In the code snippet you provided, { password: 0 } is an argument passed to the User.find() method as the projection option. It is used to specify which fields to include or exclude in the returned documents.
   // In this case, { password: 0 } means that the password field will be excluded from the returned documents. The value 0 indicates the field should be omitted from the result set.
   // By excluding the password field, you can prevent it from being sent in the response to the client. This is a common practice for security reasons, as passwords should not be exposed or sent over the network.
  
    const users =User.find(keyword, { password: 0 }).find({
        // The $ne operator is used in MongoDB to query for documents where a specific field is not equal to a given value. It is often used in combination with other query operators to perform more advanced queries.
      _id: { $ne: req.profile._id },
    //  eg the query { name: { $ne: "gaurav" } } would match documents where the name field is not equal to "gaurav". It will retrieve all users whose name is different from "gaurav".
    }).then((resp,err)=>{
        if(err){
            res.status(400);
        }
        else res.send(resp);
    });
    
  };