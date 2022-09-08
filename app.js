//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require ("mongoose");
const _ = require ("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// create a connection
mongoose.connect("mongodb+srv://Admin-Emmanuel:test123@cluster0.g6vluf1.mongodb.net/todolistDB", {useNewUrlParser: true});

// create a schema
const itemsSchema = {
  name: String
};

// create mongoose model
const Item = mongoose.model("Item", itemsSchema)

// create mongoose document
const item1 = new Item({
  name: "Welcome to My todoList!"
});

const item2 = new Item({
  name: "Hit the plus button to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete item."
});

// Put all the items(mongoose document) into an Array
const defaultItems = [item1, item2, item3];

// create a schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

// create mongoose model
const List = mongoose.model("List", listSchema);

// Default list or Home route
app.get("/", function(req,res) {

  Item.find({}, function(err,foundItems){
    if (foundItems.length === 0) {
     Item.insertMany(defaultItems, function(err){
       if(err){
         console.log(err);
       }else{
         console.log("successfully saved the default items to database!")
       }
     });
     res.redirect("/");
   } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems, route: "/"});
      }
    });
});

// Home route OR root route
app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

// create new item
    const item = new Item({
        name: itemName
    });

// to check the listName we can add new item whether the Default/Today list OR the Custom list
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


// create custom list using Express Route Params
app.get("/:customListName", function(req, res) {
      const customListName = _.capitalize (req.params.customListName);

      List.findOne({name: customListName}, function(err, foundList) {
        if (!err) {
          if (!foundList) {
            // create new list mongoose documents(this is done inside custom route)

              const list = new List ({
                name: customListName,
                items: defaultItems
              });

              list.save();
              res.redirect("/" + customListName);
          } else {
            // showing an existing list

            res.render("list", {listTitle: foundList.name, newListItems: foundList.items, route: "/"});
          }
        }
      })

});

// delete route
app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove (checkedItemId, function(err) {
        if(!err) {
          console.log("successfully deleted checked item.");
          res.redirect("/")
          }
    });
  }else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
    if (!err) {
    res.redirect("/" + listName);
    }
  });
  }
});

// Work list
// app.get ("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems, route: "/work"});
// });
//
// app.post ("/work", function (req,res) {
//
//   const item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

// about list
app.get ("/about", function (req,res) {
 res.render("about")
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
