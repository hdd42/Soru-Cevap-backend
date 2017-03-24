const express = require('express')
const MainCtrl = require('../lib/mainCtrl')
const mongoose = require('mongoose')
const User = mongoose.model('User');

const router = express.Router()

module.exports = (app) => {
    app.use('/api/teachers', router);
};

class TeacherCtrl extends MainCtrl {

    async  index(req, res, next) {
          let { query } = req.query;
          console.log('Query : ', query)
        let [teachers, count, offset, limit, orderBy, orderDirection] = await User.FindAllAndCount({ type: "Ogretmen", query })
        res.status(200).json({
            success: 1,
            message: { teachers, count, offset, limit, orderBy, orderDirection }
        })
    }

    async  create(req, res, next) {
       let user = await User.create(req.body)
       res.status(201).send({message : user})
    }

    async  find(req, res, next) {
     
    }

    async  destroy(req, res, next) {

    }
   


}
const ctrl = new TeacherCtrl();

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

