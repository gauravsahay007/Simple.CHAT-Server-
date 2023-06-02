import express  from "express";
import { allMessage, sendMessage } from "../Controllers/Message";
exports.router=express.Router();
router.post("/",sendMessage);
router.get("/:chatId",allMessage); 