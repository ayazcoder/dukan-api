const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const authRouter  = require('./routes/authRoute');
const bodyParser = require("body-parser");
const {notFound, errorHandler} = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 4000;
dbConnect();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())

app.use('/api/users', authRouter)

app.use(notFound)
app.use(errorHandler)
app.listen(PORT, ()=>{
    console.log(`Server is running at PORT: ${PORT}`)
})