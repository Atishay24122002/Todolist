
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://atishay2424:atishay2424@cluster0.0x3euh8.mongodb.net/?retryWrites=true&w=majority');
  console.log("successfully connected to mongodb")
}


const itemsSchema={
 name: String
};

const Item=mongoose.model("Item",itemsSchema);

const Item1= new Item(
 {
  name:"Welcome to your todolist"
 });
const Item2= new Item(
{
  name:"hit the + button of all the new item."
});
const Item3= new Item(
{
  name:"<-- hit this delelte the item"
});

const defaultItems=[Item1,Item2,Item3];

const listSchema={
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find()
  .then(function(foundItems) {
     if(foundItems.length===0)
     {
        Item.insertMany(defaultItems)
        .then(function() {
         console.log("sucess"); 
         }).catch(function(err) {
         console.log(err);
         res.redirect("/");
      });
     }else{
      res.render("list", {listTitle:"Today", newListItems: foundItems});
     }

   }).catch(function(err) {
    console.log(err);
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list; 
  const item=new Item({
     name: itemName
  });
  
  if(listName==="Today"){
    item.save()

    res.redirect("/");
  }else{
  List.findOne({name: listName}).then(function(foundList){
   foundList.items.push(item);
   foundList.save();
   res.redirect("/"+ listName);

  }).catch(function(err){
    console.log(err);
  });
}
});

app.post("/delete",function(req,res) {
  const itemListId= req.body.checkbox
  const listName = req.body.listname

  if(listName === "Today")
  {
    Item.findByIdAndRemove(itemListId)
    .then(function(){
     console.log("success");
     res.redirect("/");
    }).catch(function(err){
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: itemListId}}}).then(function(){

       res.redirect("/"+ listName);

    }).catch(function(err){
      console.log(err);
    })
  }
});

app.get("/:customListName", function(req,res) {
  const custumListName=_.capitalize(req.params.customListName)
  
  List.findOne({name: custumListName}).then(function(foundList){
    if(!foundList){
      const list=new List({
        name: custumListName,
        items: defaultItems
      }); 
      list.save();
      res.redirect("/"+ custumListName);
    
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  });

 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
