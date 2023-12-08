const express = require("express");
const router = express.Router();
const Users = require("../models/user");
const Videos = require("../models/video");
const Admin = require("../models/admin");
const ContactMessages = require("../models/ContactMessages");
const middleware = require("../middleware/index");
const bcrypt = require("bcryptjs");


const requireLogin = (req,res,next)=>{
    if(!req.session.oneAdmin){
        req.flash('error','Please Log in first')
        return res.redirect('/admin/login')
    }
    next();
}


router.get("/signup", (req, res) => {
    res.render("Admin/AdminSignup");
});

//@ SHOW USER LOG IN PAGE
router.get("/login", (req, res) => {
    res.render("Admin/AdminLogin");
});

router.get("/logout", middleware.isLoggedIn, function(req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.post("/signup", async(req, res) => {
    console.log(req.body)
    let hash = bcrypt.hashSync(req.body.password, 14);

    req.body.password = hash;
    
    let admin = new Admin(req.body);
    console.log(req.body)
    admin.save(function(err, doc) {
        if (err) {
            req.flash("error", "Already Taken Email/Username");
            res.redirect("/admin/signup");
        } else {
            req.flash("success", "Signup was successfull, now you can login");
            res.redirect("/admin/login");
        }
    });
});

router.post("/login", async function(req, res) {
    console.log(req.body)
    const oneAdmin = await Admin.findOne({AdminName: req.body.AdminName})
    console.log(oneAdmin);
    console.log(oneAdmin.password)
    if(oneAdmin){
        if(bcrypt.compareSync(req.body.password, oneAdmin.password)){
            console.log("ues");
            req.session.isLoggedIn = true;
            req.session.oneAdmin = oneAdmin;
            res.redirect("/admin/dashboard");
           // req.flash("success", "Login Successfull");
            //Setting Up the session
            
        }
        else{
            req.flash("error", "Incorrect Password");
            req.session.isLoggedIn = false;
            res.redirect("/admin/login");
        }
    }
    else{
        req.flash("error", "Admin does not exist");
        req.session.isLoggedIn = false;
        res.redirect("/admin/login");
    }
    //res.send('true')
    // Admin.findOne({ AdminName: req.body.Username }, (err, user) => {
    //     if (err || !user || !(bcrypt.compareSync(req.body.password, user.password))) {
    //         req.flash("error", "Incorrect Username/Password");
    //         req.session.isLoggedIn = false;
    //         res.redirect("/");
    //     } else {
    //         //console.log("Login is successfull");
    //         req.flash("success", "Login Successfull");
    //         //Setting Up the session
    //         req.session.isLoggedIn = true;
    //         req.session.user = user;
    //         res.redirect("/");
    //     }
    // });
});
//@ SHOW USER LOG OUT PAGE
router.get("/logout", function(req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/admin/login');
            }
        });
    }
});

//Admin Routes will go here
router.get("/dashboard",requireLogin,(req, res) => {
    Users.find({}, (err, foundUsers) => {
        if (err) {
            console.log(err);
        } else {
            Videos.find({}, (err, foundVideos) => {
                if (err) {
                    console.log(err);
                } else {
                    ContactMessages.find({}, (err, foundMessages) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render("Admin/AdminPanel", { Users: foundUsers, Videos: foundVideos, Messages: foundMessages });
                        }
                    });
                }
            });
        }
    });
});

router.post("/contact", (req, res) => {
    Message = new ContactMessages(req.body);
    Message.save();
    req.flash("success", "Message Sent To admins");
    res.redirect("/");
});
module.exports = router;