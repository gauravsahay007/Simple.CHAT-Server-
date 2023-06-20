const Chat = require("../Models/Chat");
const User = require("../Models/User");
const Message = require("../Models/Message");

const {getChatById} = require("../Controllers/Chat");


exports.sendMessage=(req,res)=>{
    const {content, ChatId} = req.body;

    

    var newMessage = {
        sender : req.profile._id,
        content: content,
        chat : ChatId
    }

    // console.log(newMessage);

    try{
        // https://stackoverflow.com/questions/67063573/usage-of-execpopulate
        var message = new Message(newMessage);
        // console.log(message);
        message.save().then(msg => {
            // execPopulate() to execute populate
            const x=msg.populate("sender","name pic email")
            return msg.populate("chat","users");
        })
        .then((msg,err)=>{
            if(err){
                 res.status(400);
            }
            else{
                msg.populate("chat");
                User.populate(msg,{
                    path: "chat.users",
                    select: "name pic email"
                })
                User.findOneAndUpdate(req.profile._id,{
                    // set latest message to this message
                   $push : {notifications : { message : message._id},
                            chatId : {ChatId} }
                }).then((res,err)=>{
                    // console.log(res);
                })
                
                Chat.findByIdAndUpdate(ChatId,{
                    
                    $set: {latestMessage: message}
                }).then((resp,err)=>{
                    console.log(resp);
                })
                return res.json(msg)

                
            }
           
        }) 
      
    }
    catch{
        res.json({
            error: "No message sent"
        })
    } 
}
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
exports.allMessage = (req, res) => {
  const chatId = req.chatprofile._id;

  try {
    const objectIdChatId = new ObjectId(chatId);

    const messages =  Message.find({ chat: objectIdChatId })
    .populate("sender", "name pic email")
    .populate("chat")
    .exec().then(resp=>{
        res.json(resp);
    })
 
 
} catch (error) {
  console.log(error);
  res.status(500).json({ error: "Server error" });
}
};


