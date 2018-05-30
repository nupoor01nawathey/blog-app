var express             = require("express"),
    mongoose            = require("mongoose"),
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    app                 = express();

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));  
app.use(expressSanitizer());
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/restful_blog_app");
var blogSchema = new mongoose.Schema ({
  title  : String,
  image  : String,
  body   : String,
  created: {type: Date, default: Date.now}
});


var Blog = mongoose.model("Blog", blogSchema);

// index route
app.get("/", function(req, res){
   res.redirect("/blogs"); 
});

// redirect index to display all blogs
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

app.get("/blogs/new", function(req, res) {
   res.render("new"); 
});

app.post("/blogs", function(req, res){
   //create and redirect to index
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newBlog) {
       if (err) {
           //console.log(err);
           res.render("new");
       } else {
           res.redirect("/blogs");
       }
   });
});


app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
});


app.get("/blogs/:id/edit", function(req, res) {
   Blog.findById(req.params.id, function(err, foundForEditBlog) {
       if (err ) {
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundForEditBlog}); 
       }
   });
});

app.put("/blogs/:id", function(req, res) {
    //res.send("update route");
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
      if(err) {
          res.redirect("/blogs");
      } else {
          res.redirect("/blogs/" + req.params.id); 
      }
  })
});


app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err, deleteBlog) {
       if (err) {
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Blog server has started....");
});