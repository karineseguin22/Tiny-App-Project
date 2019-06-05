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

//cookie 
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  console.log(req.body.username); 
res.redirect('/urls'); 
}); 
//update post 
  app.post('/urls/:shortURL/update', (req, res) => {
    console.log('req body:', req.body); 
    //extract id
    const id = req.params.shortURL;
    //extract updated website a
    const info = req.body.longURL;
    //update on object
    urlDatabase[id]= info; 
    console.log(urlDatabase);
    //redirect 
    res.redirect("/urls"); 
  }); 
  
  //post route
  app.post("/urls", (req, res) => {
    //create new id that will represent short url
    const id = generateRandomString(); 
    //obtain body from browser
    //const newUrl = req.body; //this line was not necessary 
    //add to object
    urlDatabase[id] = req.body.longURL; 
    //console.log(urlDatabase); //Log our new object 
    //console.log(req.body);  // Log the POST request body to the console
    //console.log(newUrl.longURL) //no longer valid 
    //console.log(id); 
    res.redirect(`/urls/${id}`);         // redirect to link of website we just added 
  });

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    //console.log(urlDatabase);
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

  //short version of "/urls/:shortURL" (not done)
  //The goal is to go to long url 
  app.get("/u/:shortURL", (req, res) => {
    //const sURL = req.params.shortURL; //not neccesary 
    const longURL = urlDatabase[req.params.shortURL];
    //console.log(urlDatabase.b2xVn2); 
    //console.log(req.params.shortURL);//gives shortURL ex: b2xVn2  
    //console.log(sURL); // gives shortURL
    //console.log(urlDatabase[sURL]);// need to put in square brakets when variable

    res.redirect(longURL);
  });

    //delete
app.post("/urls/:shortURL/delete", (req, res) =>{
  //extract id
  const id = req.params.shortURL;
  console.log(id); 
  console.log(urlDatabase[id]); 
  //delete url
  delete urlDatabase[id]; 
res.redirect("/urls");
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

