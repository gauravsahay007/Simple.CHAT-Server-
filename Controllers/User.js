const User = require("../Models/User")
const validationResult= require("express-validator")
const jwt=require("jsonwebtoken")
const authenticate=require("../Models/User")
exports.signUp=(req,res)=>{
    const {name,email,encrypted_password,profile_pic}=req.body;
    if(!name || !email || !encrypted_password){
        return res.status(400).json({
            error:"Please Enter All Fields.."
        })
    }
    const userExists=user.findOne({email});
    if(userExists){
        res.status(400).json({
            error:"User Already Exists"
        })

    }
    const user=User.create({name,email,encrypted_password,profile_pic});
    if(user){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            profile_pic:user.profile_pic,
            // token: generateToken(user._id),
        })
    }
    else{
        res.status(400).json({
            error:"Unable to create User"
        })
    }
}
exports.signIn=(req,res)=>{
    const {email,encrypted_password}=req.body;
    User.findOne({email})
    .then((user,err)=>{
        if(err || !user){
            return res.status(400).json({
                error:"User Email does not exits"
            })
        }
        if(!user.authenticate(encrypted_password)){
            return res.status(401).json({
                error : "Email and password donot match"
            })
        }
        const token=jwt.sign({_id:user._id},process.env.SECRET)
        res.cookie("token",token,{expire: new Date()+9999})
        const {_id,name,email}=user;
        return res.json({
            token,user:{_id,name,email}
        })
    })
}
//req (request) and res (response) representing the incoming request and the outgoing response, respectively
exports.storeNotification=(req,res)=>{
    const {userId,messageId,chatId}=req.body;
    //updates a user document in the database identified by the userId
    const stored=User.findByIdAndUpdate
    (userId,
//$push operator to add a new element which contains the chatId and messageId to the notifications array field of the user document
     {$push : {notifications:{chat: chatId,message:messageId}},},
     {new:true},   
     
        )
        //sends an HTTP status code 204 (No Content) as the response.
        res.status(204);
        if(!stored){
//sets the HTTP status code of the response to 400 (Bad Request). It indicates that there was an error in the request.
            res.status(400).json({
                error:"Notification can't be stored"
            })
        }
}
exports.getNotifications=(req,res)=>{
//extract the id property from the req.params object. 
//It expects the id to be provided as a route parameter.
    const id=req.params;

    const notifications=User
//This line retrieves a user document from the database based on the provided id
    .findById(id)
//.populate("notifications.message", 'sender content chat'):
// This line populates the notifications.message field of the 
//notifications document with the corresponding message document. 
//It specifies the fields to include in the populated message 
//document: 'sender', 'content', and 'chat'.
    .populate("notifications.message",'sender content chat')
//This line selects only the notifications field from the retrieved
// user document. It limits the returned document to include only the notifications field.
    .select("notifications");
//populates additional fields in the notifications document
    notifications=User.populate(notifications,{
        path:'notifications',
        populate:{
            path:'message.chat',
            populate:{
                path:'users',
                select:'name',
                model: User
            },
            select: "chatName isGroupChat users",
            model : Chat
        }
    })
    res.status(200).send(notifications);
}
exports.removeNotification=(req,res)=>{
    const {userId,chatId}=req.body;
    var remove=User
    .findByIdAndUpdate(
        userId,
        {$pull:{notifications:{chat: chatId}}},
        {new:true}
    )
    .select("notifications")
    .populate("notifications.message",'sender content chat')

    remove=User
    .populate(remove,{
        path: 'notifications',
        populate:{
            path:'message-chat',
            populate:{
                path: 'users',
                select:'name',
                model: User
            },
            select: "chatName isGroupChat users",
            model : Chat
        }
    })
    res.status(400).json(removed);
    if(!removed){
        res.status(400).json({
            error:"Notification Can't be removed"
        })
    }
}