const express = require('express');
const app = express();
const port = 5000;
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const {errorHandler} = require('./middleware/error');
const path = require('path');


// enviorment configuration
require('dotenv').config();

// db connection
const connectDB = require('./db');
connectDB();



// logger middileware
app.use(morgan('tiny'));

// cookie parser
app.use(cookieParser());


// cross origin resourse midilware
app.use(cors({origin: '*'}));

// passportjs config
require('./config/passport-local')(passport);
require('./config/passport-jwt')(passport);

// body parser
app.use(express.urlencoded({extended : false}));
app.use(express.json());


app.use('/uploads' , express.static(__dirname + '/uploads'));
// express session midilware

app.use(session({
    name : 'chitchat',
    secret : 'hbahsir',
    saveUninitialized : false,
    resave : false,
    cookie : {
        maxAge : (1000 * 60 * 100)
    },
}));

// passport midilware
app.use(passport.initialize());
app.use(passport.session());


// configure routes
app.use('/api' , require('./routes/index'));

// server frontend
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // server index.html file
    app.get("*" , (req,res) => {
        res.sendFile(
            path.resolve(__dirname , '../' , 'frontend' , 'build' , 'index.html')
        )
    });
} else {
   app.get('/' , (req,res) => res.send("Please set to production..."));
}

// error handlder middleware
app.use(errorHandler);

let server = app.listen(process.env.PORT, () => {
    console.log("server is running on the port" , process.env.PORT || port);
});

require('./socket/socket').chat_sockets(server);
