/********************* IMPORT MODULES *********************/

const HttpRequest = require('request');
const log = require('../helpers/log.js')

/**********************************************************/

const smsService = {}

smsService.sendSms = (jUserData, sTemporaryPassword, response) => {

    HttpRequest.post('http://smses.io/api-send-sms.php', {
            form: {
                mobile: jUserData.mobile_number,
                message: sTemporaryPassword,
                apiToken: '$2y$10$SxBoksnTp2WSKQUeNVC6M.AyeoVyEN6fnxo/iuAnYuxKTnN93S9Ni',
            },
        },
        (err, res) => {
            if (err) {
                log('err', 'smsService.sendSms - err  - 222 : ' + err)
                return response.json({
                    status: 'error'
                });
            }
            if (res.statusCode != 200) {
                console.error('ERROR:', res.statusCode);
                return response.json({
                    status: 'error'
                });
            }
            console.log('Sms sent:', jUserData.mobile_number)
            return response.json({
                status: 'ok'
            });
        });
}
module.exports = smsService