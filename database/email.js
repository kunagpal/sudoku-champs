/**
 * Created by kunag_000 on 04-10-2015.
 */
var email = require("emailjs");
var server = email.server.connect({
    user: "sudokuchampster@gmail.com",
    password: process.env.KEY,
    host: "smtp.gmail.com",
    ssl: true
});

exports.send = function (message, callback)
{
    server.send(message, callback);
};
exports.wrap = function (content)
{
    return email.message.create(content);
};
