var express = require('express');

var port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, function () {
    console.info('Server started at '+port+' port');
});