'use strict';

var express = require('express');
/*var mongo = require('mongodb');*/
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortUrl = require('./models/shortUrl');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/*conectar a la bd*/ 
/*mongoose.connect(proccess.env.MONGODB_URI || 'mongodb://localhost/shortUrls');*/
/*esta es la nueva sintaxis de conexion de bd desde mongoose 4.11, parece que funciona sin aclarar /shorturls y no se por q vergas*/
mongoose.connect('mongodb://localhost/', { useMongoClient: true });

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json());

// se le dice que vaya al public a tomar los archivos estaticos
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
  
});


/*app.listen(port, function () {
  console.log('Node.js listening ...');
});*/

/*Crear los valores de inicio para la bd*/

app.get('/new/:urlToShorten(*)', (req, res, next)=>{
  var { urlToShorten } = req.params;
  /*regex para la url*/
 var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
 var regex = expression;
 if(regex.test(urlToShorten)===true){
   /*crear un numero random para asignarle a la url*/
   var short = Math.floor(Math.random()*100000).toString();
   var data = new shortUrl({
     originalUrl: urlToShorten,
     shorterUrl: short
   });

   data.save(err=>{
      if(err){
        return res.send('Error para conectar con la bd');
      }
   });

  return res.json({data});
 }

 var data = new shortUrl({
   originalUrl: urlToShorten,
   shorterUrl: 'InvalidURL'
 });

/*  return res.json({urlToShorten: 'Failed'});*/
return res.json(data);
 



 /* return res.json({urlToShorten});*/
 /*console.log(urlToShorten);*/
});


/* busqueda en bd de la  Url original*/ 

app.get('/:urlToFoward', (req, res, next)=>{
//guarda el valor del parametro
  var shorterUrl = req.params.urlToFoward;

  shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data)=>{
    if (err) return res.send('error al leer la bd');
    var re = new RegExp("^(http|https)://", "i");
    var strToCheck = data.originalUrl;
    if(re.test(strToCheck)){
      res.redirect(301, data.originalUrl);
    }
    else{
      res.redirect(301, 'http://' + data.originalUrl);
    }
  });
});













/*probar que el servidor esta corriendo*/ 

app.listen(process.env.PORT || 3000, ()=>{
console.log("el servidor esta funcionando"); 
});

