exports.homePage = (req, res) => {
    res.render('index', {
        name: req.title
    })
}

exports.addStore = (req, res) => {
    res.render('editStore', {
        title: 'AddStore'
    })
}