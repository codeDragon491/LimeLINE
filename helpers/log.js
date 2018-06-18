//****************** IMPORT MODULES ******************//

const chalk = require('chalk')

//**************************************************//

const log = function (sStatus, sMessage) {

    switch (sStatus) {

        case 'ok':
            console.log(chalk.green(sMessage))
            break

        case 'err':
            console.log(chalk.red(sMessage))
            break

        case 'e':
            console.log(chalk.magenta(sMessage))
            break

        case 'info':
            console.log(sMessage)
            break
    }

}
module.exports = log