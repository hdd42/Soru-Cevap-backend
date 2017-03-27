const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const AnswerSchema = require("./Answer")

const slug = require('speakingurl')

const QuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Soru basligi zorunludur!"],
        max:180
    },
    question: {
        type: String,
        required:true
    },
    questionRawText: {
        type: String,
        required:true
    },
    user: { type: ObjectId, ref: 'User' },
    categories: [{ type: ObjectId, ref: 'Category' ,required:true}],
    answers:{
        type:[AnswerSchema]
    } ,
    solved:{
        status:{type:Boolean , default:false},
        user: { type: ObjectId, ref: 'User' }
    },
    showCount:{
        type:Number,
        default:0
    },
    votesCount:{
        total:{type:Number , default:0},
        upVote:{type:Number , default:0},
        downVote:{type:Number, default:0},
        voters:[ { type: ObjectId, ref: 'User' }]
    },
    slug:{type:String, unique:true},
    //teachers: [{ type: ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
    
},
    { timestamps: true }
);
QuestionSchema.pre('save', function (next) {
    if(this.slug) return next()
    this.slug = slug(this.title, { lang: 'tr' })
    next();
})
QuestionSchema.pre('findOne', function (next) {
    this.update({$inc:{showCount:1}}).exec()
    console.log("next")
    next();
})


QuestionSchema.virtual('answerCount').get(function () {
  return this.answers.length;
});

QuestionSchema.statics.FindAllAndCount = function ({ query, select = ["createdAt", "title", "user", "answers", "slug", 
"categories",'showCount', 'votesCount','solved'],
    userId = null }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC" } = query
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' }

    let finalQuery = { deletedAt: null };
    if (userId) {
        finalQuery.user = userId
    }
    if(orderBy=='answers'){
        finalQuery.answers={$size:0}
        sort={createdAt:'1'}
    }
    console.log("finalQuery : ", finalQuery)
    return new Promise((resolve, reject) => {
        Promise.all(
            [
                this.find(finalQuery).skip(parseInt(skip))
                .limit(parseInt(limit))
                    .select(select.join(' '))
                    .sort(sort)
                    .populate({
                        path: 'user',
                        select: 'name'
                    })
                    .populate('solved.user')
                    .populate({ path: 'categories', select: 'name slug' }),
                this.find(finalQuery).count()
            ])
            .then(([questions, count]) => resolve([questions, count, skip, limit, orderBy, orderDirection]))
            .catch(err => reject(err))

    })
}
QuestionSchema.index({ title: 'text' });
QuestionSchema.index({ slug: 'text' });

module.exports = mongoose.model('Question', QuestionSchema);