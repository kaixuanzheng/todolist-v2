//jshint esversion:6
const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash')
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect('mongodb+srv://admin-kai:admin123@cluster0.nrcpi.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const newlistSchema = {
  name: String,
  items: [itemsSchema]
};
const NewList = mongoose.model("NewList", newlistSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add new item."
});
const item3 = new Item({
  name: "<--- Click the checkbox to delete item"
});
const defaultItems = [item1, item2, item3];
let inti = 1;


app.get("/", function(req, res) {

  Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0 && inti === 1) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            inti++;
            res.redirect("/");
          }
        })
      } else {
        res.render("list", {
          listTitle: day,
          newListItems: items
        });
      }
    }
  })

});

app.post("/", function(req, res) {

  const content = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: content
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  }else{
    NewList.findOne({name:listName},function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listName);
  });
  }

});

app.post("/delete", function(req, res) {
  const listName = req.body.pageTitle;
  const itemId = req.body.checkedItem;
  if (listName !== day) {
    NewList.updateOne(
      {name: listName},
      {$pull: { items: { _id: itemId } } },
      function(err,result){}
    );
    res.redirect("/"+listName);
  } else {
    Item.deleteOne({
      _id: itemId
    }, function(err) {});
    res.redirect("/");
  }

});

app.get("/:customList", function(req, res) {
  const newListName = _.capitalize(req.params.customList);

  NewList.findOne({name: newListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const newList = new NewList({
          name: newListName,
          items: defaultItems
        });
        newList.save();
        res.redirect("/"+newListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
