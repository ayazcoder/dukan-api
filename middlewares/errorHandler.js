const { Error } = require("mongoose")

//not found
const notFound = (req, res, next)=>{
    const error = new Error(`Not found!: ${req.origionalUrl}`)
    res.status(404)
    next(error)
}

//Error handler

const errorHandler = (err, req, res, next)=>{
    const statuscode = res.statusCode == 200 ? 500 : res.statuscCode;
    res.status(statuscode);
    res.json({
        message: err?.message,
        stack: err?.stack
    })
}

module.exports = { errorHandler, notFound};