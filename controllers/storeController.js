const mongoose = require('mongoose');
const Store = mongoose.model('Store')
const tr = require('transliteration').transliterate
const slugify = require('transliteration').slugify
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
    store: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/')
        if (isPhoto) {
            next(null, true)
        } else {
            next({
                message: 'That filetype isn\'t allowed!'
            }, false)
        }
    }
}

exports.upload = multer(multerOptions).single('photo')
exports.resize = async (req, res, next) => {
    if (!req.file) {
        next()
        return
    }
    const extension = req.file.mimetype.split('/')[1]
    req.body.photo = `${uuid.v4()}.${extension}`
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO)
    await photo.write(`./public/uploads/${req.body.photo}`)
    next()
}

exports.homePage = (req, res) => {
    res.render('index', {
        title: 'Stores'
    })
}

exports.addStore = (req, res) => {
    res.render('editStore', {
        title: 'Add Store'
    })
}
exports.createStore = async (req, res) => {
    req.body.author = req.user._id
    const store = await (new Store(req.body)).save()
    req.flash('success', `Successfully Created <strong>${store.name}</strong>. Care to leave a Review`)
    res.redirect(`/stores/${store.slug}`)
}
exports.updateStore = async (req, res) => {
    const _id = req.params.id

    const updateFields = req.body
    updateFields.slug = slugify(tr(updateFields.name))
    updateFields.location.type = 'Point'
    const store = await Store.findOneAndUpdate({
        _id
    }, updateFields, {
        new: true,
        runValidators: true
    }).exec()

    req.flash('success', `Successfully Update <strong>${store.name}</strong>.<a href="/stores/${store.slug}"> View Store -></a>`)
    res.redirect(`/store/${store._id}/edit`)
}
exports.getStores = async (req, res) => {
    const stores = await Store.find()
    res.render('stores', {
        title: 'Stores',
        stores
    })
}
const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('You must be a store owner yo edit it')
    }
}
exports.editStore = async (req, res) => {
    const _id = req.params.id
    const store = await Store.findOne({
        _id
    })
    confirmOwner(store, req.user)
    res.render('editStore', {
        title: `Edit ${store.name}`,
        store
    });
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({
        slug: req.params.slug
    }).populate('author')
    if (!store) return next()
    res.render('store', {
        store,
        title: store.name
    })
}
exports.getStoresByTag = async (req, res, next) => {
    const tag = req.params.tag
    const tagQuery = tag || {
        $exists: true
    }
    const tagsPromise = Store.getTagList()
    const storesPromise = Store.find({
        tags: tagQuery
    })
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise])
    res.render('tags', {
        tags,
        stores,
        title: 'Tags',
        tag
    })

}