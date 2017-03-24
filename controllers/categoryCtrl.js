const express = require('express')
const MainCtrl = require('../lib/mainCtrl')
const mongoose = require('mongoose')
const Category = mongoose.model('Category');
const Question = mongoose.model('Question');
const Auth = require('../lib/middlewares/auth')

const router = express.Router()

module.exports = (app) => {
    app.use('/api/categories', router);
};

class CourseCtrl extends MainCtrl {

    async  index(req, res, next) {

        let categories = await Category.find({}).exec()

        res.status(200).send({ success: 1, categories })
    }

    async  create(req, res, next) {
        //  req.body.imgUrl = '/assets/img/categories/java_logo.png'
        let category = await Category.create(req.body)
        res.status(200).json({ success: 1, message: category })
    }

    async  find(req, res, next) {
        let id = req.params.id;
        let category = await Category.findById(id)

        res.status(200).json({ success: 1, message: category })
    }

    async  findQuestionByCategory(req, res, next) {
        let slug = req.params.id;
        let { query } = req;
        let category = await Category.findOne({ slug })
        if (!category) return res.status(400).json({ success: 0, message: `bu id/slug {${slug}} ile herhangi bir category bulunamadi` })
        let [questions, count, skip, limit, orderBy, orderDirection] = await Category.FindQuestionByCategoryAndCount({ catId: category._id, query })
        res.status(200).json({
            success: 1,
            category,
            questions, meta: { count, skip, limit, orderBy, orderDirection }
        })
    }

    async  destroy(req, res, next) {

    }


    async  search(req, res, next) {
        let { search = "" } = req.query
        if (!search) search = 1;
        let $regex = new RegExp(`^${search}`, 'i')
        console.log("re : ", $regex)
        let categories = await Category
            .find({ name: { $regex } })
            .select('name')
            .sort('name')
            .exec()
        res.status(200).send({ success: 1, categories })
    }

}
const ctrl = new CourseCtrl();

/*ctrl.reservedKeys = ['role', 'active', ...ctrl.defaultReservedKeys()]
ctrl.create.required = ['email', 'name', 'password']
ctrl.login.required = ['email', 'password']
*/

router.route("/*")
    .put(Auth.ensureAuth(['Admin','Member']))
    .post(Auth.ensureAuth(['Admin','Member']))
    .delete(Auth.ensureAuth(['Admin','Member']))

router.route("/")
    .get(ctrl.errorHandler(ctrl.index))
    .post(ctrl.errorHandler(ctrl.create))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route("/search")
    .get(ctrl.errorHandler(ctrl.search))
    .post(ctrl.errorHandler(ctrl.create))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/:id/questions")
    .get(ctrl.errorHandler(ctrl.findQuestionByCategory))
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

