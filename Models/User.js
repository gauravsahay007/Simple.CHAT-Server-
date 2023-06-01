//creating an instance of the Mongoose class and returning it
const mongoose=require("mongoose");
//schema defines document properties through an object where the key name corresponds to the property name in the collection
const Schema=mongoose.Schema;
const crypto=require("crypto")
//uuid:-universally unique identifier
const uuidv1=require("uuidv1");
//Creating an user schema with properties
const userSchema=new Schema({
    //name property with schema type string 
    name:{
        type:String,
        require:true
    },
    //email property
    email:{
        type:String,
        required:true,
        unique:true
    },
    //password property
    encrypted_password:{
        type:String,
        required:true
    },
//picture property with file name as a string
    profile_pic:{
        type:String,
        required:true
    },
    //schema definition for a notification .It includes two fields:
    //This schema suggests that each notification is associated with a specific chat and references a particular message within that chat.
    notifications:[
    {
        //chatId:-It is a string type field that represents the ID of the chat associated with the notification
        chatId:{type:String},
        //message: It is a reference field using the mongoose.Schema.Types.ObjectId type. It refers to a specific message object in the database, using its ObjectId 
        message:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    }
    
]
},
  {
    timestamps: true,
  }
)
//a function securePassword that takes a plainPassword and salt as 
//input and returns a securely hashed password using the SHA-256 
//algorithm. It handles cases where no password is provided and
// catches any errors that may occur during the hashing process
const safePassword=function(pswrd,salt){
    //if plain password is empty then return empty string
    if(!pswrd)return "";
 //try block to catch any potential errors that may occur during the hashing process.   
    try{
//crypto.createHmac function from the Node.js crypto module to 
//create a new HMAC (Hash-based Message Authentication Code) object
//It uses the "sha256" algorithm for hashing
//The update method is then used to update the HMAC object with the plainPassword
//the digest method is called with the argument "hex" to obtain the hexadecimal representation of the hash
        return crypto.createHmac("sha256",salt).update(pswrd).digest("hex");
    }
// catch block to handle any errors that may occur during the hashing process.
// If an error occurs, the catch block is executed
    catch(err){
//returns an empty string ""
        return "";
    }
};
const authenticate= function(pswrd){
    return this.securePassword(pswrd) === this.encrypted_password
}



//A virtual property is not persisted in the database but can be accessed and set like a regular property.
//this code snippet sets up a virtual property called "password" on the userSchema.
// When a value is assigned to the virtual property, it triggers a 
//setter function that stores the plain password, generates a salt,
// and hashes the password using the salt. The hashed password is 
//stored in the "encrypted_password" property. The getter function 
//allows accessing the plain password value through the virtual property.

//This line defines a virtual property called "password" on the userSchema
userSchema.virtual("password")
// setter function for the "password" virtual property which gets executed when a value is assigned to the virtual property.
.set((password)=>{
//Assigning the value of the password parameter to the _password property of the schema
//The _ is used to indicate that the property should be treated as private
    this._password=password;
//uuidv1() function generate a unique identifier which is then assigned to the 
//salt property of the schema instance
    this.salt=uuidv1();
//Calling the safepassword function passing password and salt generated by uuidv1 as parameters
//Assigning the resulting hashed password to the encrypted_password property
    this.encrypted_password=safePassword(password,uuidv1());
    console.log(this.encrypted_password);

})
//getter function for the "password" virtaul property gets executed when the virtual property is accessed
.get(()=>{
    return this._password;
})
 // To use our schema definition we need to convert our userSchema into a model we can work with
// We use exports to define a module that can be required elsewhere
// creating and exporting model User
module.exports=mongoose.model("User",userSchema);