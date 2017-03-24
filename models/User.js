const mongoose = require('mongoose')
const argon2 = require('argon2')
const ObjectId = mongoose.Schema.Types.ObjectId;
const { mongoError, signToken } = require('../lib/helpers')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "isim alani zorunludur!"],
        min: 3, max: 50
    },
    email: {
        type: String,
        lowercase: true,
        validate: {
            validator: function (e) {
                const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return reg.test(e);
            },
            message: '{VALUE} is not a valid email!'
        },
        unique: [true, 'bu email zaten kullaniliyor!'],
        required: [true, "email alani zorunludur!"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['Member', 'Editor', 'Admin'],
        default: 'Member'
    },

    answerCount:{type:Number , default:0},
    questionCount:{type:Number , default:0},
    solvedCount:{type:Number , default:0},

    courses: [{ type: ObjectId, ref: 'Course' }],
    students: [{ type: ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
},
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {

    let hash = '';

    if (this.isModified('password') || this.isNew) {
        try {
            hash = await argon2.hash(this.password, await argon2.generateSalt());
            this.password = hash;
            next();
        } catch (error) {
            next(error)
        }

    }
});

// compare password input to password saved in database
UserSchema.methods.comparePassword = function (pw) {
    return new Promise((resolve, reject) => {
        argon2.verify(this.password, pw).then(match => {
            resolve(match);
        }).catch(err => {
            reject(err)
        });
    })


}
UserSchema.statics.FindAllAndCount = function ({ type = 'Ogrenci', query = {},
    select = ["_id", "createdAt", "name", "email", "courses"] }) {

    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC", search = '' } = query
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' }
    console.log("Order by : ", orderBy)
    let finalQuery = { deletedAt: null, role:type };
    return new Promise((resolve, reject) => {
        Promise.all(
            [
                this.find(finalQuery).skip(parseInt(skip)).limit(parseInt(limit))
                    .sort(sort)
                    .select(select.join(' ')),
                this.count(finalQuery)
            ])
            .then(([students, count]) => {

                resolve([students, count, skip, limit, orderBy, orderDirection])
            })
            .catch(err => reject(err))

    })
}

UserSchema.statics.Register = function (newUser) {
    return new Promise((resolve, reject) => {
        const { password, password2 } = newUser;
        if (password !== password2) {
            let err = new Error('sifreler uyusmuyor!');
            err.status = 400;
            reject(err)
        }
        this.create(newUser)
            .then(user => {
                console.log("User Created!")
                resolve(user)
            })
            .catch(err => {
                console.log("err in catch : ",mongoError(err))
                reject(mongoError(err))
            })
    })
}

UserSchema.statics.Login = function (email, password) {
    let foundUser;
    return new Promise((resolve, reject) => {
        this.findOne({ email })
            .select('email name password role _id')
            .then(user => {
                if (!user) {
                    let err = new Error('Bu email ile kullanici bulunamadi')
                    err.status = 404;
                    return reject(err)
                }
                foundUser = user;
                console.log("Found : ", user)
                return user.comparePassword(password)
            })
            .then(correctPassword => {
                if (correctPassword) {
                    console.log("Pass : ", correctPassword)
                    let { token, user } = signToken(foundUser);
                    return resolve([token, user])
                }
                let err = new Error('Bu email ile / sifreniz uyusmuyor')
                err.status = 400;
                reject(err)
            })
            .catch(err => reject(err))
    })

}

UserSchema.index({ name: 'text' });

UserSchema.methods.safe = function (user) {
    const safe = { email, name, role } = user
    return safe;
}

module.exports = mongoose.model('User', UserSchema);