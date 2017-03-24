const config = require("../config/config")
const jwt = require('jsonwebtoken')

exports.getStatusCodes = () => {

}

exports.mongoError = (err) => {
    if (!err.MongoError) {
        err.status = err.status || 500
        return err;
    }
    else {
        let error = err.toJSON();
        console.log('Error : ', error)
        return error
    }
}

exports.signToken = (user) => {
    const {_id, email, name, role } = user;
    let token;
    try {
        token = jwt.sign({
            data: { email, name, role ,_id}
        }, config.tokenSecret, { expiresIn: '1h' });
        return { token, user: { email, name, role,_id } };
    } catch (error) {
        console.log("Token error : ", error)
        throw new Error("Beklenmeyen bir hata olustu!")
    }
}

exports.validateToken = (token) => {
    return new Promise((resolve, reject) => {
        // verify a token symmetric
        jwt.verify(token, config.tokenSecret, (err, decoded) => {
            if (err) reject(err)
            resolve(decoded)
        });
    })

}