import express  from "express";
import { allMessage, sendMessage } from "../Controllers/Message";
exports.router=express.Router();
router.post("/message/send",sendMessage);
router.get("/:chatId/allmessage",allMessage); 