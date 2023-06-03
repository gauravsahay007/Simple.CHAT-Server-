const express = require("express");
var router = express.Router();
const {accessChat ,fetchChats,createGroupChat,renameGroup,removeMember,addMember,getChatById} = require("../Controllers/Chat");
const {getUserById,isSignedIn} = require("../Controllers/User");

router.param("userId",getUserById);
router.param("chatId",getChatById);

router.post("/access/chat/:userId",isSignedIn,accessChat);
router.get("/fetch/chats/:userId",isSignedIn,fetchChats);
router.post("/create/groupChat",isSignedIn,createGroupChat);
router.put("/rename/group",isSignedIn,renameGroup);
router.put("/kickOut",isSignedIn,removeMember);
router.put("/addto/group",isSignedIn,addMember);
 


module.exports = router;