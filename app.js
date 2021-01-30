const express = require("express")
      bodyParser = require("body-parser")
      mongoose = require("mongoose")
      flash = require("connect-flash")
      passport = require("passport")
      LocalStrategy = require("passport-local")
      methodOverride = require("method-override")
      multer = require("multer")
      path = require("path")

      app = express()

      User = require("./models/users")
      Recipe = require("./models/recipes")

      middleware = require("./middleware")

      storage = multer.diskStorage({
          destination: "./public/uploads/",
          filename: (req, file, cb)=>{
              cb(null, file.filename + "_" + Date.now() + path.extname(file.originalname))
          }
      })

      upload = multer({
          storage: storage
      }).single("image")

mongoose.connect("mongodb://localhost/CookGuide", { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set("useCreateIndex", true)
mongoose.set("useFindAndModify", false)
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"))
app.use(flash())

app.use(require("express-session")({
    secret: "Option",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next()
})

app.get("/", (req, res)=>{
    Recipe.find({}).limit(4).exec((err, recipe)=>{
        if(err){
            console.log(err);
            res.redirect("/")
        } else {
            res.render("landing", {recipe: recipe})
        }
    })
})

app.get("/bengali_recipes", (req, res)=>{
    Recipe.find({type: "Bengali"}, (err, recipe)=>{
        res.render("category_bengali", {recipe: recipe})
    })
})

app.get("/north_indian_recipes", (req, res)=>{
    Recipe.find({type: "North Indian"}, (err, recipe)=>{
        res.render("category_n_indian", {recipe: recipe})
    })
})

app.get("/south_indian_recipes", (req, res)=>{
    Recipe.find({type: "South Indian"}, (err, recipe)=>{
        res.render("category_s_indian", {recipe: recipe})
    })
})

app.get("/maharashtrian_recipes", (req, res)=>{
    Recipe.find({type: "Maharashtrian"}, (err, recipe)=>{
        res.render("category_maharashtrian", {recipe: recipe})
    })
})

app.get("/rajasthani_recipes", (req, res)=>{
    Recipe.find({type: "Rajasthani"}, (err, recipe)=>{
        res.render("category_rajasthani", {recipe: recipe})
    })
})

app.get("/others", (req, res)=>{
    Recipe.find({type: "Others"}, (err, recipe)=>{
        res.render("category_others", {recipe: recipe})
    })
})

app.get("/see_details/:id", middleware.isLoggedin, (req, res)=>{
    Recipe.findById({_id: req.params.id}, (err, recipe)=>{
        res.render("see_details", {recipe: recipe})
    })
})

app.get("/all_recipes", (req, res)=>{
    Recipe.find({}, (err, recipe)=>{
        res.render("all_recipes", {recipe: recipe})
    })
})

app.get("/admin", middleware.isAdmin, (req, res)=>{
    res.render("admin")
})

app.post("/admin", middleware.isAdmin, (req, res)=>{
    upload(req, res, (err)=>{
        if(err){
            req.flash("error", "Oops! Something went wrong")
            return res.redirect("/admin")
        } else {
            var addRecipe = new Recipe({
                name: req.body.name,
                description: req.body.description,
                method: req.body.method,
                ingredients: req.body.ingredients,
                type: req.body.type,
                image: req.file.filename
            })

            Recipe.create(addRecipe, (err, newRecipe)=>{
                if(err){
                    console.log(err);
                    req.flash("error", "Data could not be inserted, please try again")
                    return res.redirect("/admin")
                } else {
                    req.flash("success", "Data inserted Successfully")
                    return  res.redirect("/admin")
                }
            })
        }
    })
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  }), (req, res)=>{}
)

app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var re_password = req.body.re_password;
    var pattern = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
    var email_pattern = (/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
  
    if(!email_pattern.test(username)){
      console.log("Invalid Email");
      req.flash("error", "Invalid Email");
      return res.redirect("/register");
    } else if(password != re_password) {
      console.log("Password match");
      req.flash("error", "Password does not match");
      return res.redirect("/register");
    } else if (!pattern.test(password)) {
      console.log("Invalid Password");
      req.flash("error", "Password must contain minimum 8 characters long, atleast one Upper Case, one Lower Case, one Number, and one Special Character");
      return res.redirect("/register");
    } else {
      var newUser = new User({username: req.body.username});
      User.register(newUser, req.body.password, (err, user)=>{
        if(err){
          console.log(err);
          req.flash("error", err.message);
          return res.redirect("/register");
        }
        passport.authenticate("local", {
          successRedirect: "/",
          failureRedirect: "/register",
          failureFlash: true
        })(req, res);
      });
    }
});

app.get("/logout", (req, res)=>{
    req.logout()
    res.redirect("/")
})
      
app.listen(3000, ()=>{
    console.log("Server Started at Port 3000");
})