'use strict'

var fs = require('fs');
var get = require('simple-get');
var cloudinary = require('cloudinary');
var runLimit = require('run-parallel-limit');
var mkdirp = require('mkdirp');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});

function downloadImages (urls, callback)
{
    callback = callback || function(){};

    mkdirp('./images', function (err) {
        if (err) return console.error('Error creating images directory', err);

        runLimit(urls.map(function (url) {
            return function (callback) {
                var filename = url.split('/')[url.split('/').length - 1];

                get(url, function (err, res) {
                    if (err) return console.error('error requesting', err);

                    var stream = res.pipe(fs.createWriteStream('./images/'+filename, {defaultEncoding: 'binary'}));

                    stream.on('finish', function () {
                        console.log('Added => '+filename);
                        return callback(null, url);
                    });
                });
            }
        }), 10, function (err) {
            if (err) return console.error(err);
            console.log('===> '+urls.length+' images retrieved...');
            callback();
        });
    });
}

function retrieveResources(cursor)
{
    cursor = cursor || false;

    var param = { type: 'upload', max_results: '500' };
    if (cursor) param.next_cursor = cursor;

    cloudinary.api.resources(function (result) {
        var urls = result.resources.map(function (img) {
            return img.url
        });
        console.log('=======> LAST NEXT CURSOR: '+result.next_cursor);
        downloadImages(urls, function(){
            if (result.next_cursor) {
                return retrieveResources(result.next_cursor);
            }
        });
    }, param);
}
retrieveResources(process.env.NEXT_CURSOR);
