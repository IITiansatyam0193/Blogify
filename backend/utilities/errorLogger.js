const fs = require("fs")

const errorLogger = (err, req, res, next) => {
    if(err) {
        fs.appendFile("ErrorLogger.txt" , err.stack , (e) => {
            if(e) {
                console.log("Error logging failed")
            }
        })
        res.status(err.status || 500).json({message: err.message})
    }
    next()
}

module.exports = errorLogger