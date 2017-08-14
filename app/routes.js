var express = require('express');
var router = express.Router();
var path = require('path');
path.join(__dirname, 'path/to/file')

//require('jquery');
//require('underscore');

module.exports = router;
// create routes //
router.get('/', function(req, res){
  //res.render('views/index');
  //res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
  res.sendFile('./index.html');

});
router.get('/*', function(req, res){
  //res.render('views/index');
  //res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
  res.sendFile('./index.html');
});
/*router.get('/checking_socket', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
});
router.get('/synchro', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html#synchro', { root: path.join(__dirname, '../')});
});
router.get('/login', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html#login', { root: path.join(__dirname, '../')});
});
router.get('/regis', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html#regis', { root: path.join(__dirname, '../')});
});
router.get('/dashboard', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html#dashboard', { root: path.join(__dirname, '../')});
});
router.get('/drawing', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html#drawing', { root: path.join(__dirname, '../')});
});
router.get('/ressources', function(req, res){
  //res.render('views/index');
  res.sendFile('/ressources', { root: path.join(__dirname, '../')});
});*/
/*router.get('/login', function(req, res){
  res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
});*/
router.post('/contact');
