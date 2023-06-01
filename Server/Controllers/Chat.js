const Chat = require("../Models/Chat");
const User = require("../Models/User");

// getting chatId to use it as param
exports.getChatById=(req,res,next,id)=>{
    Chat.findById(id).then((chat,err)=>{
        if(!chat || err){
            return res.status(400).json({
                error: "Oops...there is not a matching chat in database"
            })
        }
        
        chat.profile = chat;
        next();
    }
    )
}

// accessing chats of requesting user and another user from the request
exports.accessChat=(req,res)=>{
    // Id of the user from the request
    const userId = req.body.userId;

    if(!userId){
        console.log("No userId found in the request");
        return res.status(400);
    }

    
    var isChat = Chat.find(
        // we dont want groupchat but individual chats so isGroupChat is false
        {isGroupChat: false,
            // $and applies and operation to elements inside the array 
            // here it searches for a chat which contains both these users 
        $and: [
            {users: {$elemMatch : {$eq: req.profile._id}}},
            {users: {$elemMatch : {$eq: userId}}},
        ]
        }

        // we then want the user details excludind there passwords and the latest messages
    ).populate("users","-password")
    .populate("latestMessage");

        // we then populate isChat with user name pic and email of the sender here the sender is the user in the requested body
    isChat = User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    // if any chat found then return it
    if(isChat.length > 0) {
        res.send(isChat)
    }
    else{
        // else create a new chat 
        var ChatData = {
            chatName: `${req.body.name}`,
            isGroupChat: false,
            users: [userId, req.profile._id]
        }
    }

    try{
        // to save the created Chat in the database
        const createdChat = new Chat(ChatData);

        createdChat.save().then(response => {
            console.log("New Chat created");
        }).catch((err)=>{
            console.log(err);
        })
    }
    catch(err){
        res.status(400);
    }
}


exports.fetchChats=(req,res)=>{
    // try catch block for error handling
    try{
        // to find chats of the user
        // and populate all users groupAdmin latest messages also
        Chat.find({
            users: {$elemMatch : {$eq : req.profile._id}}
        }).populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt : -1})
        .then((chats)=>{
            // further populating chats name pic email of the senders 
            chats = User.populate(
                chats, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                }
            )

            res.satus(200).send(chats);
        })
    }
    catch(err){
        res.json({
            error: "Error while fetching chats"
        })
    }
}


exports.createGroupChat = (req,res) => {
    // retrieving users that will be in the group Chat and the group name
    if(!res.body.users || !req.body.name){
        return res.status(400).send({ message: "Please Fill all the fields" });
    }

    // parse the users array
    var users = JSON.parse(req.body.users);

    if(users.length<2){
        return res
        .status(400)
        .send("More than 2 users are required to form a grouop chat");
    }

    users.push(req.body.user);

    try{
        // create new GroupCHat with isGroupChat = true
        const GroupChat = new Chat({
            isGroupChat: true,
            chatName: req.body.name,
            users: users,
            groupAdmin: req.body.user
        })

        GroupChat.save().then((chat)=>{
            console.log("Created Group Chat");
            res.json(GroupChat);
        })
    }
    catch(err){
        res.json({
            error: err
        });
    }
}

exports.renameGroup = (req,res) => {
    const {chatId, chatName} = req.body;

    const updatedChat = Chat.findByIdAndUpdate(chatId,  {
        chatName: chatName
    },
    {
        new: true,
        useFindAndModify: false
    })

    if(!updatedChat){
        res.status(400).json({
            error:"Chat not found"
        })
    }else{
        res.json(updatedChat)
    }
    }

exports.addMember = (req,res) => {
    const {chatId,userId} = req.body;
    const added = Chat.findByIdAndUpdate(chatId, {
        $push : {users: userId}
    },
    {
        new: true,
        useFindAndModify: false
    }).populate("users","-password")
    .populate("groupAdmin","-password")

    if(!added){
        res.status(404).json({
            error: "Chat not found"
        })
    }else{
        res.json(added);
    }
}

exports.removeMember = (req,res) => {
    const {chatId, userId} = req.body;
    const removed = Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId},
        },
        {
            new: true,
            useFindAndModify:false
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");


    if(!removed){
        res.status(404).json({
            error:  "Chat not found"
        })
    }else{
        res.json(removed)
    }
}