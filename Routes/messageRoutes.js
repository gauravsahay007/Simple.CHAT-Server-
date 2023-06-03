const express  = require("express");
const { allMessage, sendMessage } = require("../Controllers/Message");
const {getUserById} = require("../Controllers/User")
var router = express.Router();
exports.router=express.Router();

router.param("userId",getUserById);
router.post("/message/send/:userId",sendMessage);
router.get("/:chatId/allmessage",allMessage); 

module.exports=router;