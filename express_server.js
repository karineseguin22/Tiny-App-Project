var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
return Math.floor((Math.random()*1000000000)).toString(36); 
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  app.get("/", (req, res) => {
    res.send("Hello!");
  });

  
  //post route
  app.post("/urls", (req, res) => {
    //create new id that will represent short url
    const id = generateRandomString(); 
    //obtain body from browser
    const newUrl = req.body; 
    //add to object
    urlDatabase[id] = newUrl.longURL; 
    console.log(urlDatabase); //Log our new object 
    console.log(req.body);  // Log the POST request body to the console
    console.log(newUrl.longURL)
    console.log(id); 
    res.redirect(`/urls/${id}`);         // redirect to link of website we just added 
  });

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    //console.log(templateVars);
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_news");
  });



  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    //console.log(urlDatabase[req.params.shortURL]);
    res.render("urls_show", templateVars);
  });
  


app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

