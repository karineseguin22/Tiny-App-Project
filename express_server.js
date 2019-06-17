var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['cake']

  
}))

const bcrypt = require('bcrypt');


function generateRandomString() {
  return Math.floor((Math.random()*1000000000)).toString(36); 
}

const checkEmail = function (newemail){
  for (const key in users) {
 
    if (users[key].email ==  newemail) {
      return users[key].email; 
    }
  }
  return false;  
}

const getId = function (newemail){
  for (const key in users) {
    if (users[key].email ===  newemail) {
      return users[key].id; 
    }
  }
  return false;  
  
}
const getPassword = function (password){
  for (const key in users) {
    if (users[key].password === password) {
      return true; 
    }
  }
  return false; 
  }
  
//---------------------------------------------------------------------------------
//Databases

//data base storing website links
var urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ481W"},
    "9sm5xK": { longURL: "http://www.google.com", userID: "aJ481W"}
  };

  const users = {};  
//---------------------------------------------------------------------------------
//http://localhost:8080/urls 

app.get("/", (req, res) => { //change so it does not redirect to user 
  if (req.session.user) {
    res.redirect('/urls');
    } else {
      res.redirect('/login');   
    }
});

//to obtain login page
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect('/urls');
  } else { 
  const userObject = users[req.session.user];
  let templateVars = {user: userObject};
  res.render("login", templateVars)
  }
});  

//get to obtain register page
app.get("/register", (req, res) => {
  const userObject = users[req.session.user];
  let templateVars = {user: userObject};
  res.render("urls_register", templateVars);
}); 

//to post register information 
app.post("/register", (req, res) => {
 if ( req.body.email === "" || req.body.password === ""){
  res.status(400).send("Empty field");}
  if (checkEmail(req.body.email) == req.body.email) {
    res.status(400).send("Email already exist");
  
 }else {  
  const user_id = generateRandomString(); 
  users[user_id] = {}; 
  users[user_id]["email"] = req.body.email; 
  users[user_id]["password"] = bcrypt.hashSync(req.body.password, 10); 
  users[user_id]["id"] = user_id;  
  req.session.user = user_id;   
res.redirect('/urls'); 
}
}); 

app.post('/login', (req, res) => {
  if (checkEmail(req.body.email) !== req.body.email) {
    res.status(403).send("Email and/or is invalid");
  }
  for (const key in users) {
  if (!(bcrypt.compareSync(req.body.password, users[key].password ))) {
    res.status(403).send("and/or password is invalid");
  } 
}
for (const key in users) {
  if ((bcrypt.compareSync(req.body.password, users[key].password ))) {
  req.session.user = getId(req.body.email); 
  res.redirect('/urls'); 
  }
}
  
}); 

app.post('/logout', (req, res) => {
  req.session = null; 
res.redirect('/urls'); 
}); 

app.post('/urls/:shortURL/update', (req, res) => {
  if (req.session.user) {
  const id = req.params.shortURL;
  const info = req.body.longURL;
  urlDatabase[id].longURL= info; 
  res.redirect("/urls"); 
  } else {
    res.status(403).send("Log in first"); 
  }
}); 
  
app.post("/urls/new", (req, res) => {
  //create new id that will represent short url
  const id = generateRandomString(); 
  //obtain body from browser
  //const newUrl = req.body; //this line was not necessary 
  //add to object
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longURL; 
  urlDatabase[id]["userID"] = req.session.user; 
  res.redirect(`/urls`);        
});

app.get("/urls", (req, res) => {
  const userObject = users[req.session.user];
  let templateVars = { urls: urlDatabase, user: userObject};
  res.render("urls_index", templateVars);
});

////the long url NEEDS http:// to work!!!!!!! 
app.get("/urls/new", (req, res) => { 
  const userObject = users[req.session.user];
  let templateVars = {user: userObject};
  if (req.session.user) {
  res.render("urls_news", templateVars);
  } else {
    res.redirect('/urls');   
  }
});



app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.session.user];

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: userObject, urlDatabase: urlDatabase};

  if (req.session.user) {
  res.render("urls_show", templateVars);
} else {
  res.status(403).send("Log in first");
}
});

//The goal is to go to long url 
//the long url NEEDS http:// to work!!!!!!!
app.get("/u/:shortURL", (req, res) => { 
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

    //delete
app.post("/urls/:shortURL/delete", (req, res) =>{
  if (req.session.user) {
  const id = req.params.shortURL; 
  //delete url
  delete urlDatabase[id]; 
res.redirect("/urls");
  }else{
    res.redirect("/urls"); 
  }
});
  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

