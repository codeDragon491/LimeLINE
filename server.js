/********************* IMPORT MODULES *********************/

const express = require('express');
const app = express()
app.use(express.static(__dirname + '/public'));

/******************************************* */

const fs = require('fs')

/******************************************* */
const httpsOptions = {
    key: fs.readFileSync(__dirname + '/ssl/server.key'),
    cert: fs.readFileSync(__dirname + '/ssl/server.crt')
};
const http = require('https').Server(httpsOptions, app);

/******************************************* */
const cookieParser = require('cookie-parser');
app.use(cookieParser());

/******************************************* */

const bodyParser = require('body-parser')
// if extended is false, you can not post "nested object"
app.use(bodyParser.urlencoded({
    extended: false
}))
// parse application/json
app.use(bodyParser.json())

/******************************************* */

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let filepath = './public/images/'
        cb(null, filepath)
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.split(".").pop();
        let filename = file.fieldname + '-' + Date.now() + '.' + ext
        cb(null, filename);
    }
})

const upload = multer({
    storage: storage
})

/******************************************************** */


const passport = require('passport')
const FacebookTokenStrategy = require('passport-facebook-token');
app.use(passport.initialize());

/******************************************* */

const jwt = require('jsonwebtoken')

/******************************************* */

const sqlite3 = require('sqlite3')
Object.defineProperty(global, "db", {
    value: new sqlite3.Database(__dirname + '/database.db')
})

/******************************************* */

const io = require('socket.io')(http);
Object.defineProperty(global, "io", {
    value: io
})

/******************************************* */
const port = 3443 || process.argv[process.argv.indexOf('--port') + 1];
app.set('port', port)

// **********************  IMPORT UTILS *******************************

const verifyToken = require(__dirname + '/helpers/verifyToken.js')
const log = require(__dirname + '/helpers/log.js')

// **********************  IMPORT CONTROLLERS *******************************

const user = require(__dirname + '/controllers/user.js')
const mailer = require(__dirname + '/controllers/mailer.js')
const smsService = require(__dirname + '/controllers/smsService.js')
const webSocket = require(__dirname + '/controllers/webSocket.js')

// **********************  INDEX PAGE  *******************************************

app.get('/LimeLINE', (req, res) => {
    let sIndexHtml;
    try {
        sIndexHtml = fs.readFileSync(__dirname + '/html/index.html', 'utf8')
    } catch (e) {
        log('e', 'app.get(/LimeLINE - e - 93 : ' + e)
        return res.sendStatus(500)
    }
    return res.send(sIndexHtml)
})

// ********************* SIGNUP *********************************************

app.post('/signup-user', upload.single('avatar'), (req, res) => {
    let avatarImagePath;
    let token;
    let randomNumber;
    try {
        avatarImagePath = req.file.path.split("public").pop()
        token = jwt.sign({
            username: req.body.email,
        }, "secret", {
            expiresIn: 240
        });
        randomNumber = Math.floor(1000 + Math.random() * 9000);
    } catch (e) {

        log('e', 'app.post(/signup-user - e  - 115 : ' + e)
        return res.json({
            status: "error"
        })
    }
    user.createUser(req.body, randomNumber, avatarImagePath, (err, jResult) => {
        if (err) {
            return res.send(jResult)
        }
        mailer.sendEmail(req.body, token, (err, jResult) => {
            if (err) {
                return res.send(jResult)
            }
            console.log(jResult)
            return res.send(jResult)
            //smsService.sendSms(req.body, randomNumber, res)
        })
    })
})

// ********************* ACTIVATE ACCOUNT *********************************************

app.get('/LimeLINE/activate/:token', (req, res) => {
    let token;
    try {
        token = req.params.token;
    } catch (e) {
        log('e', 'app.get(/LimeLINE/activate/:token - e - 147 : ' + e)
        return res.status(403).send("No Token");
    }
    if (token) {
        //Decode the token
        jwt.verify(token, "secret", (err, decod) => {
            if (err) {
                log('err', 'app.get(/LimeLINE/activate/:token - err - 156 : ' + err)
                return res.status(403).send("Expired Token");
            }
            req.decoded = decod;
            user.activateUser(decod, (err) => {
                if (err) {
                    return sendStatus(500)
                    log('err', 'app.get(/LimeLINE/activate/:token - e - 165 : ' + err)
                }
                //console.log(decod.username)
                let sIndexHtml;
                try {
                    sIndexHtml = fs.readFileSync(__dirname + '/html/index.html', 'utf8')
                    // replace placeholders
                    sIndexHtml = sIndexHtml.replace('{{feedback-message}}', 'feedback-message')
                } catch (e) {
                    log('e', 'app.get(/LimeLINE/activate/:token - e - 174 : ' + e)
                    return res.sendStatus(500)
                }
                return res.send(sIndexHtml)
            })

        })
    }
})

/**************** FACEBOOK LOGIN ***********************/

passport.use(new FacebookTokenStrategy({
    clientID: '186453582058048', //FACEBOOK_APP_ID // 562353024149441
    clientSecret: '36ccf4c62830eef75a2cacf7cfcefd8d', //FACEBOOK_APP_SECRET 8b3d5b9923bda272239d3304f1b923ce
    profileFields: ['id', 'name', 'photos', 'emails']
}, function (accessToken, refreshToken, profile, done) {
    let user = {
        email: profile.emails[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        avatar: profile.photos[0].value,
        id: profile.id
        //token: accessToken
    }
    console.log(user)
    return done(null, user)
}));

app.post('/login-user/facebook', passport.authenticate('facebook-token', {
    session: false
}), (req, res) => {
    console.log(req.user)
    user.FBLogin(req.user.id, (err, jResult) => {
        if (err) {
            return res.send(jResult)
        }
        let token;
        try {
            token = jwt.sign({
                user: jResult,
            }, "supersecret")
            res.header('token', token)
        } catch (e) {
            return res.json({
                status: "error"
            })
            log('e', 'app.get(/auth/facebook/token - e - 241 : ' + e)
        }
        return res.send(jResult)
    })
});

/********************* LOGIN *********************/

app.post('/login-user', (req, res) => {
    user.loginUser(req.body, (err, jResult) => {
        if (err) {
            return res.json(jResult)
        } else {
            let token;
            try {
                token = jwt.sign({
                    user: jResult,
                }, "supersecret")
            } catch (e) {
                return res.json({
                    status: "error"
                })
                log('e', 'app.get(/login-user - e - 200 : ' + e)
            }
            console.log(token);
            return res.json({
                token: token
            })
        }
    })
})

/********************* VERIFY USER *********************/

app.get('/verify-user', verifyToken, (req, res) => {

    jwt.verify(req.token, "supersecret", (err, authData) => {
        if (err) {
            res.statusCode = 500;
            return res.json({
                status: "error"
            });
            log('err', 'app.get(/verify-user - err - 219 : ' + err)
        }
        return res.json({
            authData
        });
        console.log(authData)
    })
})

/********************* GET USERS *********************/

app.get('/get-users/:id', (req, res) => {
    let sUserId;
    try {
        sUserId = req.params.id
    } catch (e) {
        log('e', 'app.get(/get-users/:id : ' + e)
        return res.json({
            status: "error"
        })
    }
    user.getAllUsers(sUserId, res)
})


/********************* API *********************/

app.delete('/LimeLINE/api/v1/users/delete/:boolean', (req, res) => {
    let inactive;
    try {
        inactive = req.params.boolean
    } catch (e) {
        log('e', 'app.delete(/LimeLINE/api/v1/users/delete/:boolean - e - 291 : ' + e)
        return res.status(500).send({
            message: "INTERNAL SERVER ERROR"
        })
    }
    user.deleteInActive(inactive, res)
})
// ********************* SEND MESSAGE + FILE UPLOAD *********************************************

app.post('/send-message', upload.single('file'), (req, res) => {
    //let sChatFilePath = req.file.path.split("public").pop()
    //console.log(sChatFilePath)
    /*user.saveMessage( req.body, sChatFilePath, (err, jResult) => {
        if (err) {
            return res.send(jResult)
        }
        return res.send(jResult)
    })*/
})
/********************* PORT CONNECTION *********************/

http.listen(port, function () {
    console.log('listening on: *' + port);
});