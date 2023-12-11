const jwt = require("jsonwebtoken");

function generateToken(id) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            id
        }, process.env.JWT_KEY, {
            expiresIn: "30d",
        },(err,result)=>{
			if(err) reject(err);
			resolve(result);
		});
    });
}

module.exports = {
    generateToken
};
