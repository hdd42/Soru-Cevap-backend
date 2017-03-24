const express = require('express')
const MainCtrl = require('../lib/MainCtrl')
const mongoose = require('mongoose')
const Question = mongoose.model('Question');
const Category = mongoose.model('Category');
const Auth = require('../lib/middlewares/auth')

const router = express.Router()
module.exports = (app) => {
    app.use('/api/questions', router);
};

class StudentCtrl extends MainCtrl {

    async  index(req, res, next) {

        let { query } = req;
        let [questions, count, skip, limit, orderBy, orderDirection] = await Question.FindAllAndCount({ query })
        res.status(200).json({
            success: 1,
            questions, meta: { count, skip, limit, orderBy, orderDirection }
        })
    }

    async  create(req, res, next) {
        req.body.user = req.user._id
        let question = await Question.create(req.body)
         
        let categories = question.categories
        for (let cat of categories) {
            Category.findByIdAndUpdate(cat, {$inc:{questionCount:1}}).exec()
        }
        res.status(201).send({ message: question, categories })
    }

    async  find(req, res, next) {

    }

    async  findBySlug(req, res, next) {
        let slug = req.params.slug;
        let question = await Question.findOne({ slug }).populate('categories').populate('user')
        res.status(200).json({ success: 1, message: question })
    }

    async  destroy(req, res, next) {

    }
    async  addAnswer(req, res, next) {
        let id = req.params.id;
        let question = await Question.findByIdAndUpdate(id, { $push: { answers: req.body } }, { new: true })
        if (!question) return res.status(404).json({ success: 0, message: `Bu id {${id}} ile eslesen soru bulunamadi!` })
        res.send({ success: 1, answers: question.answers })
    }

    async  findAnswers(req, res, next) {
        let id = req.params.id;
        let question = await Question.findOne({ slug: id }).select('answers')

        res.send({ question })
    }

    async  vote(req, res, next) {
        let id = req.params.id;
        let upOrDown = req.body.vote;
        let query = {
            'votesCount.total': 1
        }
        if (upOrDown == 'up') {
            query['votesCount.upVote'] = 1;
        } else {
            query['votesCount.downVote'] = 1;
        }

        let question = await Question.findByIdAndUpdate(id, {
            $inc: query
        })

        res.send({ success: 1, voted: upOrDown })
    }

    async search(req, res, next) {
        console.log('sss')

        let { search = "", filter = 'all' } = req.query

        let finalyQuery = {

        }

        let $regex = new RegExp(`${search}`, 'i')
        console.log("re : ", $regex)
        let questions = await Question
            .find({ title: { $regex } })
            .select('title slug')
            .sort('title')
            .exec()
        res.status(200).json({ success: 1, questions })
    }


}
const ctrl = new StudentCtrl();

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
    .delete(ctrl.errorHandler(ctrl.destroy))
router.route("/:id")
    .get(ctrl.errorHandler(ctrl.find))
    .delete(ctrl.errorHandler(ctrl.destroy))


router.route("/slug/:slug")
    .get(ctrl.errorHandler(ctrl.findBySlug))
    .delete(ctrl.errorHandler(ctrl.destroy))
//.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
router.route("/:id/answers")
    .get(ctrl.errorHandler(ctrl.findAnswers))
    .post(ctrl.errorHandler(ctrl.addAnswer))
    .delete(ctrl.errorHandler(ctrl.destroy))

router.route("/:id/vote")
    .put(ctrl.errorHandler(ctrl.vote))
    .post(ctrl.errorHandler(ctrl.addAnswer))
    .delete(ctrl.errorHandler(ctrl.destroy))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route('/:id/courses')
    .get(ctrl.errorHandler(ctrl.findCourses))

