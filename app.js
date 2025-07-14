if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");

const override = require("method-override");
const WrapAsync = require('./util/WrapAsync.js');
const ExpressError = require('./util/ExpressError.js');
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');


const flash  = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(express.urlencoded({extended:true}));
app.use(override("_method"));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


const Listing = require("./models/listing.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLAS_URL;

const store = MongoStore.create({
    mongoUrl:dbUrl,
    
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600 // time in seconds
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret:  process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 *24 * 60 *60 * 1000,
        maxAge:  + 7 *24 * 60 *60 * 1000,
        httpOnly: true,
    }, 

};



// app.get("/",(req,res) =>{
//     res.send("hi i am root");
// })


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // console.log(res.locals.success);
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async(req,res) =>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//    let registeredUser = await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// })

main()
.then(()=>{
    console.log("database connected")

}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect ( dbUrl  );
    
}

const validateListing= (req,res,next) =>{
    let { error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
};
// const validateReview= (req,res,next) =>{
//  let { error} = reviewSchema.validate(req.body);
//     if(error){
//         let errmsg = error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errmsg);
//     }else{
//         next();
//     }
// };

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


/*app.get("/testlisting",async(req,res) =>{
    let samplelisting = new Listing({
        title: "My new home",
        description: "By the mountain",
        price: 2000,
        location:"kerla",
        Country:"india"
    });
    await samplelisting.save();
    console.log("sample was saved");
    res.send("sucessful testing");
})*/
// 



app.all("*", (req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
//middlewere
app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "something Went WRONG"}=err;
   res.status(statusCode).render("error.ejs", { message });
   // res.status(statusCode).send(message);
});

app.listen(8080,() =>{
    console.log("listening");
});