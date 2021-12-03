const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const https = require("https");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/UserDB")

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemsSchema);
const listSchema = new mongoose.Schema({
    name: String,
    item: [itemsSchema]
})

const List = mongoose.model("List", listSchema);
const workSchema = new mongoose.Schema({
    name: String
});

const Work = mongoose.model("Work", workSchema);


const temp1 = new Item({
    name: "Cook Food"
});
const temp2 = new Item({
    name: "Eat Food"
});
const temp3 = new Work({
    name: "Something Food"
});
const defaultItems = [temp1, temp2, temp3];

// var day = today.toLocaleDateString("en-US",options);
app.get("/", function (req, res) {
    Item.find(function (err, Items) {
        if (err)
            console.log(err);
        else {
            if (Items.length == 0) {
                Item.insertMany([temp1, temp2, temp3], function (err) {
                    console.log("successfully addded");
                    res.redirect("/");
                });
            }
            else {
                res.render("list", { listTitle: "Today", newItems: Items });
            }
        }
    })
});

app.get("/:customListName", function (req, res) {

    const Customlistname = req.params.customListName;

    List.findOne({ name: Customlistname }, function (err, foundList) {
        if(!err)
        {
            if (!foundList) {
                const list = new List({
                    name: Customlistname,
                    item: defaultItems
                });
                list.save();
                res.redirect("/" + Customlistname);
            }
            else {

                res.render("list", { listTitle: foundList.name, newItems: foundList.item });
            }
        }

    });

});

app.post("/delete", function (req, res) {
    const checkItemId = req.body.Checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkItemId, function (err) {
            if (!err) {
                console.log("Successfully Deleted");
                res.redirect("/")
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: checkItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/", function (req, res) {

    var itemName = req.body.newItem;
    var listName = req.body.list;
    console.log(req.body.list);
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (!err) {
                foundList.item.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }

});
let port = process.env.PORT
if(port==null || port==""){
    port=3000;
}
app.listen(port, function () {
    console.log("server is running Successfully");
})


