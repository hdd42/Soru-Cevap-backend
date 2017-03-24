const express = require('express')
const MainCtrl = require('../lib/MainCtrl')
const mongoose = require('mongoose')
const User = mongoose.model('User');

const router = express.Router()

module.exports = (app) => {
    app.use('/api/users', router);
};

class UsertCtrl extends MainCtrl {

    async  index(req, res, next) {
        let users = await User.find({}).exec()
        res.status(200).send({success:1, message:{ users}})
    }

    async  create(req, res, next) {
       let user = await User.create(req.body)
       res.status(200).json({User})
    }

    async  find(req, res, next) {
        let id= req.params.id
        console.log("Id : ",id)
        let user = await User.findById(id).exec()
        res.status(200).json({success:1 , message:{user}})
    }

    async  destroy(req, res, next) {
          let id= req.params.id
        console.log("Id : ",id)
        let user = await User.findByIdAndRemove(id);
        res.status(200).json({success:1 , message:{user}})
    }
   


}
const ctrl = new UsertCtrl();

/*ctrl.reservedKeys = ['role', 'active', ...ctrl.defaultReservedKeys()]
ctrl.create.required = ['email', 'name', 'password']
ctrl.login.required = ['email', 'password']
*/
router.route("/")
    .get(ctrl.errorHandler(ctrl.index))
    .post(ctrl.errorHandler(ctrl.create))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route("/:id")
    .get(ctrl.errorHandler(ctrl.find))
    .delete(ctrl.errorHandler(ctrl.destroy))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
 router.route('/:id/courses')
 .get(ctrl.errorHandler(ctrl.findCourses))   

