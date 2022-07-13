const BigPromise = require('../middlewares/BigPromise')

exports.home = BigPromise(async (req, res) => {
    // const db = await something happening
    res.status(200).json({
        success: true,
        greeting: "Hello from API"
    })
})


// If we do not want to use BigPromise.js
exports.homeDummy = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            greeting: "Hello from Dummy"
        })
    }
    catch (error) {
        console.log(error);
    }
    
}