import express from 'express'
import * as path from 'path'

var app = express()
var port = process.env.PORT || 8080;
// var port = process.env.PORT || 8050;
var BASE_URL = process.env.BASE_URL || '/m/';
const __dirname = path.resolve();

app.use(BASE_URL, express.static('dist') );
app.use(BASE_URL + '*', express.static('dist'))

// app.get(BASE_URL, (request, response) => {
//     console.log('request:', request)
//     response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     response.header('Expires', '-1');
//     response.header('Pragma', 'no-cache');
//     response.sendFile(path.join(__dirname, 'dist/index.html'));
// });

app.listen(port, function () {
    console.info('Server started at '+port+' port');
});
