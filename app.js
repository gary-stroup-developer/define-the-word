require('dotenv').config();
const request = require("request");
const https = require("https");
const express = require("express");
const bodyparser = require("body-parser");
const hbs = require("hbs");
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const password = process.env.DB_PASS;

mongoose.connect("mongodb+srv://admin-gary:"+password+"@definetheword.l53tw.mongodb.net/dictionaryDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true});
const dictionarySchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: String
});

const Subscribe = mongoose.model('Subscribe',dictionarySchema);

const app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('views'))

app.set('view engine', 'hbs');

app.get("/", function(req, res){
    res.render(__dirname+"/views/index.hbs");
})

app.get("/about",(req,res)=>{
    res.render(__dirname+"/views/about.hbs");
})

app.get("/signup",(req,res)=>{
    res.render(__dirname+"/views/signup.hbs");
})

app.get("/signUpFailure",(req,res)=>{
    res.render(__dirname+"/views/signUpFailure.hbs");
})

app.get("/successfulSignUp",(req,res)=>{
    res.render(__dirname+"/views/successfulSignUp.hbs");
})

app.post("/", function(req,res){
    const word = req.body.word;
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en_US/" + word;
    https.get(url,(response)=>{
        response.on("data",(data)=>{
            const dictData = JSON.parse(data);
            const statusCodeNum = response.statusCode.toString();
            
            if(statusCodeNum !== "404" && dictData[0] !== undefined){
                const definition = dictData[0].meanings[0].definitions[0].definition;
                const partOfSpeech = dictData[0].meanings[0].partOfSpeech;
                const synonyms = dictData[0].meanings[0].definitions[0].synonyms; //an array
                if(synonyms != undefined){
                    const synonymsLegible = synonyms.join(", ");
                    const dictDataOptions = {
                        partOfSpeech,
                        definitionInsert: definition,
                        Synonyms: "Synonyms",
                        synoynmsList: synonymsLegible
                    }
                    res.render("index",dictDataOptions)
                }
                else{
                    const dictDataOptions = {
                        partOfSpeech,
                        definitionInsert: definition,
                        Synonyms: "Synonyms",
                        synonymsList: " " 
                    }
                    res.render("index",dictDataOptions)
                }
                
            }
            else{
                dictDataOptions = {
                    partOfSpeech: dictData.title,
                    definitionInsert: dictData.message,
                    Synonyms: dictData.resolution,
                    synoynmsList: " "
                }
                res.render("index",dictDataOptions)
            }
            
        })

    })
    
    
})

app.post("/submit",(req,res)=>{
    const subscribe = new Subscribe({
        first_name: req.body.fName,
        last_name: req.body.lName,
        email: req.body.email
    });

    Subscribe.create(subscribe,function(err){
        if(err){
            console.log("Was not able to connect to the database");
            res.redirect("/signUpFailure");
        }
        else{
            res.redirect("/successfulSignUp");
        }
    })
    
    
})

app.listen(port, function(){
    console.log("Up and running in express on port " +port);
    
})

