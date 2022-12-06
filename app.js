// to use the data given by the user on the web page
import bodyParser from "body-parser";

// to setup the local server
import express from "express";

// to import local module of the project
import * as date from "./date.js";

// import lodash for handling the url
import _ from "lodash";

// to import mongoose for dataase connection
import mongoose from "mongoose";

const app = express();

// connecting mongodb with the database
mongoose.connect("mongodb+srv://SachinPal:Sachin-89@cluster0.avdhl.mongodb.net/todoDB");

mongoose.set('strictQuery', false);

// Schema for To-do List
const taskSchema = new mongoose.Schema({
    title: String
});

//Creating a Model for default list
const Default = mongoose.model("Default", taskSchema);

// Creating a Model for a custom list
const itemSchema = new mongoose.Schema({
    title: String,
    items: [taskSchema]
});

// module for custom list
const Custom = mongoose.model("Custom", itemSchema);

// to run the ejs in the project
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {

    //to get the document stored in Default Collection(Model)
    Default.find({}, (err, task) => {
        if (err) {
            console.log(err);
        } else {
            // to render using ejs and dynamically setting the value of variables
            res.render("lists", { day: "Home", newListItems: task });
        }
    })
});

app.post("/", (req, res) => {

    // to push any new item added to the list
    var item = req.body.newItem;

    if (req.body.button === "Home") {

        // creating a note item by using taskSchema
        const docD = new Default({
            title: item
        });

        docD.save();

        // since all value must be pass in every render so redirecting to .get where render is already performed
        res.redirect("/");
    }
    else {

        // Define which page are we using actually
        const name = req.body.button;

        // creating a note item by using taskSchema
        const docI = new Default({
            title: item
        });

        // To find the document for given page and adding the new note to it
        // If this document  is not found as page is new we create it using upsert
        Custom.findOneAndUpdate({ title: name }, { $push: { items: docI } }, { upsert: true }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Entered Successfully");
            }
        });

        // redirecting to the page by which the element was added so that  to show the complete list
        res.redirect("/" + name);
    }

});

app.post("/delete", (req, res) => {

    // getting the id of the item and converting it into an MongoDB Object
    const itemID = mongoose.Types.ObjectId(req.body.itemNote.trim());

    // getting the name of the list we are currently in
    const listTitle = req.body.listName;

    // If we are on default page
    if (listTitle === "Home") {

        // Find the element with the id of item to be removed
        Default.findByIdAndRemove({ _id: itemID }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted Successfully");

                // Once done return to home page
                res.redirect("/");
            }
        });
    } else {

        // find the document with given title first
        // then pull the document from the items element which is a list 
        // this should be done if the id of document matches with the id of item to be removed
        Custom.findOneAndUpdate({ title: listTitle }, { $pull: { items: { _id: itemID } } }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted Successfully");

                // Once done return to the page
                res.redirect("/" + listTitle);
            }
        });
    }
});

app.get("/:customList", (req, res) => {

    //used lodash to capitalize the customList that the user enters
    const name = _.capitalize(req.params.customList);

    // to get the document stored in Work collection(model)
    Custom.find({ title: name }, (err, task) => {
        if (err) {
            console.log(err);
        } else {

            // If we are visiting the page for first time then pass an empty array
            if (task.length === 0) {
                res.render("lists", { day: name, newListItems: task });
            }
            else {
                // To passes the items stored for the given title
                res.render("lists", { day: name, newListItems: task[0].items });
            }

        }
    })
});

app.get("/about", (req, res) => {
    res.render("about", {});
});

// to make us aware of fact that server is running
let port = process.env.PORT;
if (port == null || port == "") {
    port = 2000;
}
app.listen(port, () => {
    console.log("Server Running");
})