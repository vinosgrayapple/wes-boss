const passport = require('passport')
const mongoose = require('mongoose');
const User = mongoose.model('User')
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require(`../handlers/mail`)


exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
})

exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'You are now logged out! ✋')
    res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
        return
    }
    req.flash('error', 'OOPS you must be logged in to do that!')
    res.redirect('/login')
}

exports.forgot = async (req, res) => {
    // see if a user with that email exists
    const user = await User.findOne({
        email: req.body.email.trim().toLowerCase()
    })
    if (!user) {
        req.flash('error', `No ${req.body.email} account  exists!`)
        res.redirect('/login')
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save()
    // Send email an email with token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`

    await mail.send({
        user,
        filename: 'password-reset',
        subject: 'Password Reset',
        resetURL
    })
    // redirect to login page
    req.flash('success', `A Link for modificate the password for  your account <strong>${req.body.email.toLowerCase()}</strong>`)
    res.redirect('/login')
}
exports.reset = async (req, res) => {
    // console.log('hello!');
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    })
    if (!user) {
        req.flash('error', `Link wrong or has expired!`)
        return res.redirect('/login')
    }
    res.render('reset', {
        title: 'Reset Yor Password',
        name: user.name,
        email: user.email

    })
}

exports.confirmedPassword = async (req, res, next) => {
    if (req.body.password === req.body["password-confirm"]) {
        next()
        return
    }
    req.flash('error', 'password do not match')
    res.redirect('back')
}
exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    })

    if (!user) {
        req.flash('error', `Link wrong or has expired!`)
        return res.redirect('/login')
    }
    const setPassword = promisify(user.setPassword, user)
    await setPassword(req.body.password)
    user.resetPasswordExpires = undefined
    user.resetPasswordToken = undefined
    const userUpdated = await user.save()
    await req.login(userUpdated)
    req.flash('success', `A password changed`)
    res.redirect('/')
}