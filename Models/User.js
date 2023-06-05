const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuidv1");
mongoose.set("strictQuery",true);
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name:{
        type:String,
        required: true,
        maxlength:32,
        trim:true
    },
    email:{
        type:String,
        required: true,
        unique:true,
        trim:true
    },
    encry_password: {
        type: String,
        required: true
    },
    salt:String,
    pic:{
        type: String,
        required: true,
        default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    notifications:[
        {
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat"
            },

            message: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            }
             
        }
    ]

},{timestamps: true})

 userSchema.methods={
    securePassword: function(plainpassword){
        if(!plainpassword) return "";

        try{
            return crypto.createHmac('sha256',this.salt).update(plainpassword).digest('hex');
        }catch(err){
            console.log("Error in saving password");
        }
    },
    authenticate: function(plainpassword){
        return this.securePassword(plainpassword) === this.encry_password
    }
 }

 userSchema.virtual("password").set(function(password){
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
 },{timestamps:true}).get(function(){
    return this._password;
 })


 module.exports = mongoose.model("User",userSchema);