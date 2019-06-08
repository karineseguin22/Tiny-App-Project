var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.floor((Math.random()*1000000000)).toString(36); 
}

const checkEmail = function (newemail){
  for (const key in users) {
    //console.log('user:' + users); 
    //console.log(`e-mail: ${users[key].email}  `); 
    if (users[key].email ==  newemail) {
      return users[key].email; 
    }
  }
  return false;  
}
//console.log(checkEmail()); 
const getId = function (newemail){
  for (const key in users) {
    //console.log('user:' + users); 
    console.log(`e-mail: ${users[key].email}  `); 
    if (users[key].email ===  newemail) {
      return users[key].id; 
    }
  }
  return false;  
  
}
const getPassword = function (password){
  for (const key in users) {
    //console.log('user:' + users); 
    //console.log(`e-mail: ${users[key].email}  `); 
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

  //creating global object called user 
  const users = {}
//---------------------------------------------------------------------------------
//http://localhost:8080/urls 

app.get("/", (req, res) => {
  res.send("Hello!");
});

//to obtain login page
app.get("/login", (req, res) => {
  const userObject = users[req.cookies.user];
  let templateVars = {user: userObject};
  res.render("login", templateVars)
}); 

//get to obtain register page
app.get("/register", (req, res) => {
  const userObject = users[req.cookies.user];
  let templateVars = {user: userObject};
  // console.log(req.cookies);
  // console.log(userObject); 
  // console.log(templateVars); 
  // console.log(users); 
  res.render("urls_register", templateVars);
}); 

//to post register information 
app.post("/register", (req, res) => {
 if ( req.body.email === "" || req.body.password === ""){
  res.status(400).send("Empty field");}
  if (checkEmail(req.body.email) == req.body.email) {
    res.status(400).send("Email already exist");
  
 }else {  
  const user_id = generateRandomString().toString(); 
  users[user_id] = {}; 
  users[user_id]["email"] = req.body.email.toString(); 
  users[user_id]["password"] = req.body.password.toString(); 
  users[user_id]["id"] = user_id.toString();  
  res.cookie("user", user_id) //created cookie 
res.redirect('/urls'); 
}
//console.log(users); 
}); 


  //cookie 
app.post('/login', (req, res) => {
  //res.cookie("username", req.body.username) //no longer need 
  //console.log(req.body.username); 
  //console.log(`show id:${getId(req.body.email_)}`); 
  if (checkEmail(req.body.email) !== req.body.email) {
    res.status(403).send("Email and/or is invalid");
  }
  if (!getPassword(req.body.password)) {
    res.status(403).send("and/or password is invalid");
  } else {
    res.cookie("user", getId(req.body.email)) //set cookie
    // console.log(`what is cookie:${getId(req.body.email)}`);
    // console.log(req.body); 
    // console.log(req.body.email); 
  res.redirect('/urls'); 
}
}); 

app.post('/logout', (req, res) => {
  res.clearCookie('user'); 
res.redirect('/urls'); 
}); 

//update post 
app.post('/urls/:shortURL/update', (req, res) => {
  // console.log('req body:', req.body); 
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
app.post("/urls/new", (req, res) => {
  //create new id that will represent short url
  const id = generateRandomString(); 
  //obtain body from browser
  //const newUrl = req.body; //this line was not necessary 
  //add to object
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longURL; 
  //urlDatabase[id]["userID"] = req.cookie.user; 
  console.log('urlDatabase', urlDatabase); //Log our new object 
  //console.log(req.body);  // Log the POST request body to the console
  //console.log(newUrl.longURL) //no longer valid 
  //console.log(id); 
  res.redirect(`/urls/${id}`);         // redirect to link of website we just added 
});

app.get("/urls", (req, res) => {
  const userObject = users[req.cookies.user];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userObject = users[req.cookies.user];
  let templateVars = {user: userObject};
  //only client that is registed can acces this page -> check 
  // if (user_id === undefined){
  //   res.redirect('/urls/'); 
  // }
  if (req.cookies.user) {
  res.render("urls_news", templateVars);
  } else {
    res.redirect('/urls');   
  }
});



app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.cookies.user];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: userObject};
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
  // console.log(id); 
  // console.log(urlDatabase[id]); 
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

