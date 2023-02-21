class ErrorResponse extends Error {
     constructor(message ) {
        super(message);
     }
}

module.exports = ErrorResponse;