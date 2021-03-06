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
  
  //this generates the current date in mm/dd/yyyy format
  const getDate = function (){
  const fullDate =new Date();
  const dd = String(fullDate.getDate()).padStart(2, '0');/* padStart() is a method that allows to have zeroother numbers before 5 ex: 05*/
  const mm =  String((fullDate.getMonth())+ 1).padStart(2, '0'); //note month is from 0 to 11, so add 1 
  const yyyy =  String(fullDate.getFullYear()); 
  const date = mm + '/' + dd + '/' + yyyy; 
  return date; 
  }
//---------------------------------------------------------------------------------
//Databases

//data base storing website links
var urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ481W", date:"06/25/19"},
    "9sm5xK": { longURL: "http://www.google.com", userID: "aJ481W", date:"06/25/19"}
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
  if (req.session.user) {
    res.redirect('/urls');
  } else { 
  const userObject = users[req.session.user];
  let templateVars = {user: userObject};
  res.render("urls_register", templateVars);
  }
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

app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user) {
  const id = req.params.shortURL;
  const info = req.body.longURL;
  urlDatabase[id].longURL= info; 
  urlDatabase[id].date= getDate(); //update date 
  res.redirect("/urls"); 
  } else {
    res.status(403).send("Log in first"); 
  }
}); 
  
app.post("/urls", (req, res) => {
  if ((req.body.longURL).substring(0,7) === 'http://') { //check if http:// is there when creating link
  //create new id that will represent short url
  const id = generateRandomString(); 
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longURL; 
  urlDatabase[id]["userID"] = req.session.user; 
  urlDatabase[id]["date"] = getDate(); 
  res.redirect('/urls');   
  }else{
    res.status(403).send("Add http:// at the beginning");
  }    
});

app.get("/urls", (req, res) => {
  const userObject = users[req.session.user];
  let templateVars = { urls: urlDatabase, user: userObject};
  res.render("urls_index", templateVars);
});

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
  if (!req.session.user) {
  res.status(403).send("Log in first");
  //}else if(urlDatabase[req.params.shortURL] = undefined){
    //res.status(403).send("The URL does not exist"); 
  }else if(req.session.user && urlDatabase[req.params.shortURL].userID != req.session.user){
    res.status(403).send("You can only edit your own URL");
} else {
  res.render("urls_show", templateVars);
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

