const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aritra:hE0TG975w0lkEKXg@cluster0.z5mts.mongodb.net", {useNewUrlParser: true});
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){

    if(foundItems.length == 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err) console.log(err);
        else console.log("Successfully inserted all items.");
      });
    }

    else
      res.render("list",{title: "Home", newListItems: foundItems});
  });
});

app.get("/:listName",function(req, res){
  const nameOfList = _.capitalize(req.params.listName);

  List.findOne({name: nameOfList}, function(err, foundList){
    if(!err)
    {
      if(!foundList)
       {
         //Create a new list
          const list = new List({
            name: nameOfList,
            items: defaultItems
          });
         list.save();
         res.redirect("/" + nameOfList);
       }
       else
        res.render("list", {title: foundList.name, newListItems: foundList.items});
     }
  });
});

app.post("/", function(req,res){
  let listTitle = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if(listTitle == "Home")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listTitle}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Home")
  {
    Item.findByIdAndRemove(id, function(err){
      if(!err)
      {
        console.log("Successfully deleted !");
        res.redirect("/");
      }
    });
  }

  else
  {
    List.findOneAndUpdate({name: listName},
                      {$pull: {items: {_id: id}}},
                      function(err, foundList){
                        if(!err)
                          res.redirect("/" + listName);
                        }
           );
  }
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
