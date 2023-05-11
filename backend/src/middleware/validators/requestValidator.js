const { check } = require('express-validator');

module.exports.validateLoginRequest = () => {
    return [ 
        check('username', "Username param doesn't exists").exists(),
        check('password', "Password param doesn't exists").exists(),
        check('domain', "Domain param doesn't exists or bad formed").exists().matches('^([a-zA-Z]+)@([a-zA-Z]+)$'),
        check('app', "Application param doesn't exists").exists()
       ] 
}