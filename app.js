const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');


//Set Port
const port = 3000;
const redisPort = 6379;


//set Host
const redisHost = '172.17.0.2';

//Init app
const app = express();

//Create a Redis Client
let client = redis.createClient(redisPort, redisHost);

client.on('connect', function(){
    console.log('Connected to Redis... PORT:'+redisPort+ " HOST:"+redisHost);
});

//View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//Body-parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methodOverride
app.use(methodOverride('_method'));

app.get('/', function(req, res, next){
    res.render('searchusers');
});

//Search processing
app.post('/user/search', function(req, res, next){
    let id = req.body.id;

    client.hgetall(id,function(err, obj){
        if(!obj){
            res.render("searchusers",{
                error: 'User does not exists'
            })
        }else{
            obj.id = id;
            res.render('details',{
                user:obj
            })
        }
    });
});

//Add User Page
app.get('/user/add', function(req, res, next){
    res.render('adduser');
});

//Add User Page
app.post('/user/add', function(req, res, next){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id,[
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(err, reply){
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    }); 
});

//Delete User Page
app.delete('/user/delete/:id', function(req, res, next){
    client.del(req.params.id);
    res.redirect('/');
});


app.listen(port, function(){
 console.log('Server started on port' + port);
});