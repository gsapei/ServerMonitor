class Answer {
    constructor() {
    }

    getSuccessfullAnswer(token){
        return {
            success: true,
            message: 'You logged in successfully',
            token: token
        };
    }

    getWrongAnswer(errors){
        return {
            success: false,
            message: 'Forbidden access',
            token: "incorrect",
            errors: errors
        };
    }
    
}

module.exports = Answer;