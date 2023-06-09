
require('dotenv').config(); 
//Include Cloudinary's Node.js classes in your code
const cloudinary = require('cloudinary').v2;

//cloudinary configuration
//I have set all the credentials as a secret in .env file 
//for accessing the secrets, dotenv file has been imported at the top
cloudinary.config({ 
    //configure your cloud_name
    cloud_name: process.env.CLOUDINARY_NAME, 
    //Your api_key and api_secret are also needed for secure API calls to Cloudinary
    api_key: process.env.CLOUDINARY_APIKEY, 
    api_secret : process.env.CLOUDINARY_APISECRET
  });
  
//   //This code is using the Cloudinary JavaScript SDK to upload an image to the Cloudinary platform
//   //The first argumaent is an url which specifies the source location of the image.
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
// //The second argument is an object that contains options for the upload
// //which has a property public_id set to "olympic_flag"
// //The public_id is a unique identifier that you can assign to the uploaded image.
//   { public_id: "olympic_flag" }, 
//   //The third argument is a callback function that will be executed once the upload is complete
//   //with parameters error and result 
//   //If there is an error during the upload process, the error parameter will contain information about the error. If the upload is successful, the result parameter will contain the details of the uploaded image.
//   //The result object will contain various properties related to the uploaded image, such as the public ID, URL, dimensions, and other metadata.
//   function(error, result) {console.log(result); });
//exporting cloudinary module to use it in all the parts of the server

module.exports =cloudinary