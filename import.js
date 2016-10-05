'use strict'

var fs = require('fs');
var path = require('path');
var get = require('simple-get');
var cloudinary = require('cloudinary');
var runLimit = require('run-parallel-limit');
var mkdirp = require('mkdirp');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});

// Loop through all the files in the temp directory
var folder = './images';
fs.readdir(folder, function (err, files) {
    if (err) {
        console.error("Could not list the directory.", err);
        exit;
    }
    files.forEach(function (file, index) {
        // Make one pass and make the file complete
        var filepath = path.join(folder, file);
        cloudinary.uploader.upload(filepath, function(result) {
            if (result.public_id) {
                console.log(' - '+result.public_id+' uploaded.');
            } else {
                console.error(JSON.stringify(result));
            }
        });
    });
});
