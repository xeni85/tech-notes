require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose');
const {logEvents} = require('./middleware/logger')
const PORT = process.env.PORT || 3000;


console.log(process.env.NODE_ENV)

connectDB()

app.use(logger);

app.use(cors(corsOptions));

//add json data
app.use(express.json());

//long version of app.use(express.static('public'));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use('/', require('./routes/root'))

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views' , '404.html'));
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'});
    } else {
        res.type('text').send('404 Not Found');
    }
})

app.use(errorHandler);

mongoose.connection.once('open', ()=> {
    console.log('connected to mongoDB');
    app.listen(PORT, () => console.log('listening on port ' + PORT));
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})