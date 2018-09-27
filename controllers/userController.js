const mongoose = require('mongoose');
const User = mongoose.model('User')
const promisify = require('es6-promisify')

exports.loginForm = (req, res) => {
    res.render('login', {
        title: 'Login'
    })
}
exports.registerForm = (req, res) => {
    res.render('register', {
        title: 'Register',
        body: {}
    })
}
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name')
    req.checkBody('name', 'You must supply a name!').notEmpty()
    req.checkBody('email', 'That email is invalid!').isEmail()
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    })


    req.checkBody('password', 'Password cannot be Blank!').notEmpty()
    req.checkBody('password-confirm', 'Confirmed Password cannot be Blank!').notEmpty()
    req.checkBody('password-confirm', 'OOps! Your password do not match!').equals(req.body.password)
    const errors = req.validationErrors()
    if (errors) {
        req.flash('error', errors.map(err => err.msg))
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash()
        })
        return // stop the function
    }
    next()
}


exports.register = async (req, res, next) => {
    const user = new User({
        email: req.body.email,
        name: req.body.name
    })
    const register = promisify(User.register, User)
    console.log(user, req.body.password);
    await register(user, req.body.password)
        .catch(console.log)
    next() //pass to authController
}
exports.editAccount = (req, res) => {
    res.render('editAccount', {
        title: 'Edit Your Account'
    })

}

exports.updateAccount = async (req, res) => {
    const updates = {
        email: req.body.email,
        name: req.body.name
    }
    const user = await User.findOneAndUpdate({
        _id: req.user._id
    }, {
        $set: updates
    }, {
        new: true,
        runValidators: true,
        context: 'query'
    })
    req.flash('success', 'Updated the profile')
    res.redirect('back')
}