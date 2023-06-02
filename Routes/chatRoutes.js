import express  from "express";
const router=express.Router();
import getChatById, { addMember, createGroupChat, removeMember, renameGroup } from "../Controllers/Chat"
import {accessChat ,fetchChats}from "../Controllers/Chat"
//doubt
router.post("/:chatId",getChatById);
router.post("/",accessChat);
router.get("/",fetchChats);
router.post("/groupChat",createGroupChat);
router.put("/rename",renameGroup);
router.put("/kickOut",removeMember);
router.put("/addgroup",addMember);
export default router;


