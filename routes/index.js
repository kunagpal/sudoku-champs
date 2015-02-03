//var express = require('express');
var router = require('express').Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// GET login page
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});
// GET registration page
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Express' });
});
// GET developers page
router.get('/developers', function(req, res, next) {
    res.render('developers', { title: 'Express' });
});
//GET rules
router.get('/rules', function(req, res, next) {
    res.render('rules', { title: 'Express' });
});
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
// GET forgot password page
router.get('/forgot', function(req, res, next) {
    res.render('forgot', { title: 'Express' });
});

module.exports = router;
