
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require("connect-flash");
const dotenv = require('dotenv');
dotenv.config();

//Requiring Routes
const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");
const videoRoutes = require("./routes/video");

//Connecting To Database
// mongoose.connect('mongodb://127.0.0.1:27017/video_streaming',{useNewUrlParser: true}) // background m mongod chlna chiye tabh hi connect hoga
// .then(()=>{
//     console.log("mongo connection open")
// })
// .catch(err =>{
//     console.log("oh no mongo error")
//     console.log(err)
// })

mongoose
    .connect('mongodb://127.0.0.1:27017/video_streaming', {
        useNewUrlParser: true,
        //useCreateIndex: true,
        //useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to Mongo!');
    })
    .catch((err) => {
        console.error('Error connecting to Mongo', err);
    });
//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);
//mongoose.set('useUnifiedTopology', true);

//Middlewares
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride("_method"));
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret lubba wubba dubba etc'
}));
//To have a global variable across
app.use(function(req, res, next) {
    if (req.session.isLoggedIn) {
        res.locals.currentUser = req.session.user;
    } else {
        res.locals.currentUser = null;
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


//Using Routes
app.use("/", indexRoutes);
app.use("/admin", adminRoutes);
app.use("/video", videoRoutes);


app.get("*", (req, res) => {
    res.send("Some Error page will go here");
});
app.listen(3000, () => {
    console.log(`The Server has started on port ${3000}`);
});
