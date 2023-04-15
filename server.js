const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
app.use(logger);
//add json data
app.use(cors(corsOptions));
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
app.listen(PORT, () => console.log('listening on port ' + PORT));
    