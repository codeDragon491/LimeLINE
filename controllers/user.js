const log = require('../helpers/log.js')

/**********************************************************/

const user = {}

/************************************* CREATE USER ************************ */

user.createUser = (jUserData, sTemporaryPassword, sUserImagePath, fCallback) => {

    var aData = [
        null,
        jUserData.first_name,
        jUserData.last_name,
        jUserData.email,
        jUserData.mobile_number,
        sTemporaryPassword,
        sUserImagePath,
        0
    ]

    var sQuery = 'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)'

    db.run(sQuery, aData, (err) => {
        if (err) {
            log('err', 'user.createUser - err - 26 : ' + err)
            return fCallback(true, {
                status: "error"
            })
        }
        console.log('GREAT, user created')
        return fCallback(false, {
            status: "ok"
        })
    })
}

/************************************* ACTIVATE USER ************************ */

user.activateUser = (jUserData, fCallback) => {
    console.log(jUserData.username)
    var aData = [
        1,
        jUserData.username,
    ]

    var sQuery = 'UPDATE users set active = ? WHERE email = ?'

    db.run(sQuery, aData, (err) => {
        if (err) {
            log('err', 'user.activateUser - err - 51 : ' + err)
            return fCallback(true)
        }
        console.log('GREAT, user activated')
        return fCallback(false)
    })
}

user.FBLogin = (sFacebookProfileId, fCallback) => {

    var aData = [
        sFacebookProfileId
    ]
    var sQuery = 'SELECT facebook_profile_id, first_name, last_name, email, avatar FROM facebook_users WHERE facebook_profile_id = ?'
    console.log(sFacebookProfileId)
    db.get(sQuery, aData, function (err, jRow) {
        if (err) {
            log('err', 'user.FBLogin - err - 67 : ' + err)
            return fCallback(true, {
                status: "error"
            })
        }
        if (jRow == undefined) {
            console.log('USER NOT FOUND')
            return fCallback(true, {
                status: "error"
            })
        }
        console.log('GREAT, user logged in via FB')
        return fCallback(false, jRow)
        console.log(jRow)
    })

}

/************************************* LOGIN USER ************************ */

user.loginUser = (jUserData, fCallback) => {
    var aData = [
        jUserData.email,
        jUserData.password,
        1
    ]
    var sQuery = 'SELECT id, first_name, last_name, email, mobile_number, avatar FROM users WHERE email = ? AND password = ? AND active = ?'

    db.get(sQuery, aData, function (err, jRow) {
        if (err) {
            log('err', 'user.loginUser - err - 71 : ' + err)
            return fCallback(true, {
                status: "error"
            })
        }
        if (jRow == undefined) {
            console.log('USER NOT FOUND')
            return fCallback(true, {
                status: "error"
            })
        }
        console.log('GREAT, user logged in')
        return fCallback(false, jRow)
        console.log(jRow)
    })
}

/***************************** DELETE INACTIVE USER API ***********************/

user.deleteInActive = (jUserData, response) => {

    var aData = [
        jUserData
    ]
    var sQuery = 'DELETE FROM users WHERE active = ?'
    db.run(sQuery, aData, function (err) {
        if (err) {
            log('err', 'user.deleteInActive - err - 95 : ' + err)
            response.statusCode = 500;
            return response.send({
                message: "INTERNAL SERVER ERROR"
            })
        }
        // No results returned mean the object is not found
        if (this.changes === 0) {
            console.log(this.changes)
            // We are able to set the HTTP status code on the res object
            response.statusCode = 404;
            return response.send({
                message: "NOT FOUND"
            })
        }
        console.log('GREAT, inactive users deleted')
        response.statusCode = 204;
        return response.send({
            message: "OK. Row(s) deleted:" + this.changes
        })
    })
}

/************************************* GET ALL USERS ************************ */

user.getAllUsers = (sUserId, response) => {
    var aData = [
        sUserId
    ]
    var sQuery = 'SELECT id, first_name, last_name, avatar FROM users WHERE id NOT IN (?)'

    db.all(sQuery, aData, function (err, ajRows) {
        if (err) {
            log('err', 'getAllUsers - err - 132 : ' + err)
            return response.json({
                status: "error"
            })
        }
        if (ajRows == 0) {
            console.log('users NOT FOUND')
            return response.json({
                status: "error"
            })
        }
        console.log('GREAT, users found')
        return response.send(ajRows)
    })
}

/*user.saveMessage = ( jUserData, sFilePath, fCallback) => {

    var aData = [
        null,
        // message 
        sFilePath

    ]
    var sQuery = 'INSERT into messages (?,?)'
    db.run(sQuery, aData, function (err) {
        if (err) {
            console.log(err)
            return fCallback({
                status: "error"
            })
        }
        return res({
            status: "OK. Row(s) inserted:" + this.changes
        })
    })
}*/
module.exports = user