const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slugs = require('slugs')
const tr = require('transliteration').transliterate
const slugify = require('transliteration').slugify

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply coordinates!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must suply an author'
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
})
// Define our index
storeSchema.index({
    name: 'text',
    description: 'text'
})
storeSchema.index({
    location: '2dsphere'
})


storeSchema.pre('save', async function (next) {
    if (!this.isModified('name')) {
        next()
        return
    }
    this.slug = slugify(tr(this.name))
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*)?)$`, 'i')
    const storesWithSlug = await this.constructor.find({
        slug: slugRegEx
    })
    if (storesWithSlug) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`
    }

    next()
})
storeSchema.statics.getTagList = function () {
    return this.aggregate([{
        $unwind: '$tags'
    }, {
        $group: {
            _id: '$tags',
            count: {
                $sum: 1
            }
        }
    }, {
        $sort: {
            count: -1
        }
    }])
}
// find reviews where the stores property _id === reviews store property
storeSchema.virtual('reviews', {
    ref: 'Review', // What model to Link
    localField: '_id', // Which field on the store?
    foreignField: 'store' // Which field on the review?
})
module.exports = mongoose.model('Store', storeSchema)