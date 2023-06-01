const Chat = require("../Models/Chat");
const User = require("../Models/User");
const Message = require("../Models/Message");

const {getChatById} = require("../Controllers/Chat");
const Message = require("../Models/Message");

exports.sendMessage=(req,res)=>{
    const {content, ChatId} = req.body;

    if(!content || ChatId) {
        console.log("Invalid data");
        return res.status(400);
    }

    var newMessage = {
        sender : req.profile._id,
        content: content,
        chat : ChatId
    }

    try{
        // https://stackoverflow.com/questions/67063573/usage-of-execpopulate
        var message = new Message(newMessage);
        message.save().then(msg => {
            // execPopulate() to execute populate
            return msg.populate("sender","name pic").execPopulate();
        })
        .then(msg=>{
            msg.populate("chat").execPopulate();
        })
        .then(msg=>{
            return User.populate(msg,{
                path: "chat.users",
                select: "name pic email"
            })
        })
        .then(populatedmessage=>{
            console.log(populatedmessage);
        })
        .catch((err)=>{
            console.log(err);
        });

        Chat.findByIdAndUpdate(req.profile._id,{
            // set latest message to this message
            latestMessage: message
        })
    }
    catch{
        res.json({
            error: "No message sent"
        })
    }
}

exports.allMessage=(req,res)=>{
    const {ChatId} = req.body;
    try{
        //  It specifies the fields to be populated ("sender") and the fields to include from the populated document ("name", "pic", "email")
        const message = Message.find({chat: ChatId}).populate("sender","name pic email").populate("chat");
        res.json(message)
    }
    catch(err){
        res.status(400).json({
            error: err
        })
    }
}
