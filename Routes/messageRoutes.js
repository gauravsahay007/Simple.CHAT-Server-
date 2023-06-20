const express  = require("express");
const { allMessage, sendMessage } = require("../Controllers/Message");
const {getUserById} = require("../Controllers/User");
const { getChatById } = require("../Controllers/Chat");
var router = express.Router();


router.param("userId",getUserById);
router.param("chatId",getChatById);
router.post("/message/send/:userId",sendMessage);
router.get("/:chatId/allmessage",allMessage); 

module.exports=router; 