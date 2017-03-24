const express = require('express')
const MainCtrl = require('../lib/mainCtrl')
const mongoose = require('mongoose')
const User = mongoose.model('User');
const Auth = require('../lib/middlewares/auth')

const router = express.Router()

module.exports = (app) => {
    app.use('/auth', router);
};

class AuthCtrl extends MainCtrl {

    async  login(req, res, next) {
       let {email,password} = req.body;
       const [token,user] = await User.Login(email,password)
       res.status(200).json({success:1,message:{token,user}})
    }

    async  register(req, res, next) {
        console.log(req.body)
        let user = await User.Register(req.body)
        res.status(200).json({success:1,message:'registered!'})
    }

    async  find(req, res, next) {
     
    }

    async  destroy(req, res, next) {

    }
}
const ctrl = new AuthCtrl();

/*ctrl.reservedKeys = ['role', 'active', ...ctrl.defaultReservedKeys()]
ctrl.create.required = ['email', 'name', 'password']
ctrl.login.required = ['email', 'password']
*/
router.route("/register")
    .post(ctrl.errorHandler(ctrl.register))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route("/login")
    .post(ctrl.errorHandler(ctrl.login))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))

router.route('/*').all(ctrl.errorHandler(ctrl.notAllowed));
 

