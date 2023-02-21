const errorHandler = (err,req,res,next) => {
     const statusCode = res.statusCode ? res.statusCode : 500;
 
     res.status(statusCode);
   
     res.json({
        message : err.message,
        status : res.statusCode,
        stack : process.env.PRODUCTION ? null : err.stack
     });
     
}

module.exports = {
    errorHandler
}