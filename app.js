const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')

// npm install express-session --save
var session = require('express-session')

// setting up middleware to use the session
app.use(session({
  secret: 'eagle',
  resave: false,
  saveUninitialized: false
}))

let trips = []
let users = []
let currentUser = {}

const Trip = require('./trip')
const User = require('./user')

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// setting the templating engine to use mustache
app.engine('mustache',mustacheExpress())
// setting the mustache pages directory
app.set('views','./views')
// set the view engine to mustache
app.set('view engine','mustache')


app.get('/login',function(req,res){
  res.render('login')
})

app.get('/index',function(req,res){
  res.render('index',{username : req.session.username})
})

function validateLogin(req,res,next) {
  if(req.session.username) {
    next()
  }else {
    res.redirect('/login')
  }
}

app.all('/views/*',validateLogin,function(req,res,next){
  next()
})


//register
app.post('/register',function(req,res){
  let username = req.body.username
  let password = req.body.password

  let newUser = new User(username,password)
  users.push(newUser)

  console.log(users)

  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = hour

  res.redirect('/login')
})

//login
app.post('/login',function(req,res){
  let username = req.body.username
  let password = req.body.password

  currentUser = users.find(function(user){
    return user.username == username && user.password == password
  })

  console.log(currentUser)
  res.render('index')
})




app.post('/logout',function(req,res){
  req.session.destroy()

  currentUser = {}

  res.redirect('/login')
  console.log(currentUser)
})


app.get('/index',function(req,res){
  res.render('index')
})

app.get('/',function(req,res){
  res.render('register')
})

app.get('/trips',function(req,res){
  res.render('trips',{tripListing : trips})

})

app.post('/deleteTrip',function(req,res){
  let tripId = req.body.tripId

  currentUser.trips = currentUser.trips.filter(function(trip){
    return trip.tripId != tripId
  })
   console.log(currentUser)
  res.render('trips',{tripListing : currentUser.trips})
})


app.post('/trips',function(req,res){

  let tripId = guid()

  let title = req.body.title
  let leave = req.body.leave
  let comeBack = req.body.comeBack
  let imageURL = req.body.imageURL

  let newTrip = new Trip(tripId,title,leave,comeBack,imageURL)

  currentUser.trips.push(newTrip)


  console.log(currentUser)
  res.render('trips',{tripListing : currentUser.trips })
})


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


app.listen(3000, () => console.log('Example app listening on port 3000!'))
