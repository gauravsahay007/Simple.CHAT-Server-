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
            return msg.populate("sender","name pic email");
        })
        .then((msg,err)=>{
            if(err){
                return res.status(400);
            }
            else{
                msg.populate("chat");
                User.populate(msg,{
                    path: "chat.users",
                    select: "name pic email"
                })

                return res.json(msg);
            }
           
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
    }
    catch{
        res.json({
            error: "No message sent"
        })
    }
}

exports.allMessage=(req,res)=>{
    const {chatId} = req.body;
    try{
        //  It specifies the fields to be populated ("sender") and the fields to include from the populated document ("name", "pic", "email")
        const message = Message.find({chats : {$elemMatch : {$eq : chatId}}}).populate("sender","name pic email").populate("chat").then((resp,err)=>{
            // console.log(resp);
            if(err){
                res.status(400).json({
                    error: err
                })
            }
            else return res.json(resp);
        });
       
    }
    catch(err){
       console.log("error");
    }
}

