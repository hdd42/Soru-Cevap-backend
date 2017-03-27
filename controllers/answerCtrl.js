
const express = require('express')
const MainCtrl = require('../lib/mainCtrl')
const mongoose = require('mongoose')
const Question = mongoose.model('Question');
const Auth = require('../lib/middlewares/auth')
const ObjectId = require('mongoose').Types.ObjectId;

const router = express.Router()

module.exports = (app) => {
    app.use('/api/answers', router);
};

class AnswerCtrl extends MainCtrl {

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

    async questionSolved(req, res, nex) {
        let id = req.params.id
        console.log('is : ', id)
        let question = await Question.findOneAndUpdate({
            'answers._id': id
        }, {
                $set: {
                    'solved.status': true,
                    'solved.user': req.user._id,
                    solvedMark: true,
                    "answers.$.solverMark": true,
                    "answers.$.user": req.user._id,

                }
            }, { new: true })
        res.status(200).json({ success: 1, question })
    }

    async vote(req, res, next) {
        let id = req.params.id;
        let upOrDown = req.body.vote;
        let userId = req.user._id
        let query = '';
        if (upOrDown == 'up') {
            query = 'positiveCount';
        } else {
            query = 'negativeCount'
        }

        let question = await Question.findOne({
            'answers._id': id
        })
        let voting = false;
        for (let a of question.answers) {
            if (a._id == id) {
                if (a.voters.indexOf(userId) < 0) {
                    a.voters.push(userId)
                    a[query] = a[query] + 1
                    voting = true;
                    break;
                } else {
                    return res.status(200).send({ success: 0, message: `yanliz bir kere oy kullanabilirsiniz!` })
                }
            }
        }
        if (voting) {
            await question.save()
            return res.status(200).send({ success: 1, voted: upOrDown })
        }
        res.status(404).json({ success: 0, message: 'cevap bulunamadi!' })
        /*    let answer = await Question
                .findOneAndUpdate({
                    'answers._id': id,
                    'answers.voters': { $nin: [userId] }
                }, {
                    $inc: query,
                    $push: { 'answers.$.voters': userId }
                })*/

    }

    async destroy(req, res, next) {
        let id = req.params.id;
        let userId = req.user._id

        let query = {
            $pull: { answers: { '_id': id } }
        }
        let question = await Question.update({
            'answers._id': id,
            'answers.user': userId
        }, query)
        console.log('s : ', question)
        if (question.nModified) {
            return res.status(200).json({ success: 1, message: 'deleted' })
        }

        res.status(404).send({ success: 0, message: `bu id{${id}} ile eslesen bir cevap bulunamadi` })

        /*    let answer = await Question
                .findOneAndUpdate({
                    'answers._id': id,
                    'answers.voters': { $nin: [userId] }
                }, {
                    $inc: query,
                    $push: { 'answers.$.voters': userId }
                })*/
    }

    async update(req, res, next) {
        let { questionId, answerId, answer, answerRaw, title } = req.body

        let question = await Question.findOneAndUpdate({
            _id: questionId,
            'answers._id': answerId
        },
        { $set: { "answers.$.answer" : answer,"answers.$.title":title ,"answers.$.answerRaw":answerRaw  } }
        ,{new :true})
        .populate('answers.user')
        let a = question.answers.id(answerId)
        res.status(200).send({success:1,answer:a})
    }

}
const ctrl = new AnswerCtrl();

/*ctrl.reservedKeys = ['role', 'active', ...ctrl.defaultReservedKeys()]
ctrl.create.required = ['email', 'name', 'password']
ctrl.login.required = ['email', 'password']
*/

router.route("/*")
    .put(Auth.ensureAuth(['Admin', 'Member']))
    .post(Auth.ensureAuth(['Admin', 'Member']))
    .delete(Auth.ensureAuth(['Admin', 'Member']))
//api/answers/58d5e29d7a0dd43d0c85efb8/vote
router.route("/")
    .get(ctrl.errorHandler(ctrl.index))
    .post(ctrl.errorHandler(ctrl.create))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route("/:id/solved")
    .put(ctrl.errorHandler(ctrl.questionSolved))
    .post(ctrl.errorHandler(ctrl.create))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/:id/vote")
    .put(ctrl.errorHandler(ctrl.vote))
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
    .put(ctrl.errorHandler(ctrl.update))
    //.post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create))
    .all(ctrl.errorHandler(ctrl.notAllowed));
router.route('/:id/courses')
    .get(ctrl.errorHandler(ctrl.findCourses))

