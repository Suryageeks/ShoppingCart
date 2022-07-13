// try catch and async and await || use promise

module.exports = func => (req, res, next) =>
    Promise.resolve(func(req,res,next)).catch(next)