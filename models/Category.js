const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const slug = require('speakingurl')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "isim alani zorunludur!"]
    },
    description: {
        type: String,
    },
    imgUrl: String,
    slug: { type: String, unique: true },
    questionCount: { type: Number, default: 0 },
    //teachers: [{ type: ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
},
    { timestamps: true }
);
CategorySchema.pre('save', function (next) {
    if (this.slug) return next()
    this.slug = slug(this.name, { lang: 'tr' })
    next();
})
CategorySchema.statics.FindQuestionByCategoryAndCount = function ({ query, select = ["createdAt", "title", "user", "answers", "slug",
    "categories", 'showCount', 'votesCount', 'solved'],
    catId }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC" } = query
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' }

    let finalQuery = { deletedAt: null };

    if (orderBy == 'answers') {
        finalQuery.answers = { $size: 0 }
        sort = { createdAt: '1' }
    }
    console.log("finalQuery : ", finalQuery)

    return new Promise((resolve, reject) => {

        finalQuery.categories = { $in: [catId] }
        console.log("F Q : ", finalQuery)
        return Promise.all(
            [

                mongoose.model('Question').find(finalQuery).skip(parseInt(skip))
                    .limit(parseInt(limit))
                    .select(select.join(' '))
                    .sort(sort)
                    .populate({
                        path: 'user',
                        select: 'name'
                    })
                    .populate({ path: 'categories', select: 'name slug' }),
                mongoose.model('Question').find(finalQuery).count()
            ])
            .then(([questions, count]) => resolve([questions, count, skip, limit, orderBy, orderDirection]))
            .catch(err => reject(err))
    })

}




CategorySchema.statics.FindAllAndCount = function ({ query, select = ["_id", "createdAt", "title", "user", "comments", "slug", "category"],
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
CategorySchema.index({ name: 'text' });

module.exports = mongoose.model('Category', CategorySchema);