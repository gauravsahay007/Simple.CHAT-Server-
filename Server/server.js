// DATABASE
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
mongoose.set("strictQuery",true);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


// --------------------------------------------
// Routes




// ----------------------------------------------

// ----------------------------------------------
//APIs




// ----------------------------------------------

mongoose.connect(process.env.DATABASE,{   
}).then(()=>{   
    console.log("DB Connected")
})

const port = process.env.PORT || 7000;

app.listen(port, ()=> {
    console.log(`app is running at port ${port}`);
})


