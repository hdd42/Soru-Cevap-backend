const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const slug = require('speakingurl')

const AnswerSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: [true, "Cevap Metni Zorunludur!"]
    },
    title:{
         type: String,
        required: [true, "Baslik Alani Zorunludur!"]
    },
    answerRaw:{
        type: String,
        required: [true, "Cevap (string) Alani Zorunludur!"]
    },
    positiveCount: { type: Number, default: 0 },
    negativeCount: { type: Number, default: 0 },
    user: { type: ObjectId, ref: 'User' },
    solverMark:{type:Boolean , default:false},
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
},
    { timestamps: true }
);


AnswerSchema.statics.FindAllAndCount = function ({ query, select = ["_id", "createdAt", "title", "user", "comments", "slug", "category"],
    home = false, userId = null }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC", slug = false, search = '' } = query
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' }

    if (home) { select.push('highlight') } else { select.push('body') }

    let finalQuery = { deletedAt: null };
    if (userId) {
        finalQuery.user = userId
    }
    if (search) {
        finalQuery.$text = { $search: search }
    }
    console.log("search : ", finalQuery)
    return new Promise((resolve, reject) => {
        Promise.all(
            [
                this.find(finalQuery).skip(parseInt(skip)).limit(parseInt(limit))
                    .select(select.join(' '))
                    .sort(sort)
                    .populate({
                        path: 'user',
                        select: 'name'
                    })
                    .populate({ path: 'category', select: 'title slug' }),
                this.find(finalQuery).count()
            ])
            .then(([posts, count]) => resolve([posts, count, skip, limit, orderBy, orderDirection]))
            .catch(err => reject(err))

    })
}


module.exports = AnswerSchema