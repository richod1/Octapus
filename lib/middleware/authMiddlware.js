const jwt=require("jsonwebtoken")


function generateToken(user,secretKey,expiresIn,customPayload){
    const defaultPayload={
        user:{
        id:user.id,
        username:user.username,
        role:user.role,
    },

}

const payload=customPayload?{...defaultPayload,...customPayload}:defaultPayload;


const options={
    expiresIn:expiresIn||'1h',
}
return jwt.sign(payload,secretKey,options);
}

// function to authenticate user
function authenticate(req,res,next){
    const token=req.header('Authorization');

    if(!token){
        return res.status(401).send('Unauthorized')
    }

    try{
        const decoded=jwt.verify(token,req.authMiddlewareSecretKey || 'default-secret-key');
        req.user=decoded.user;
        next();

    }catch(err){
        res.status(401).send('Invalied Token');
    }
}

// authorized function

function authorize(roles){
    return (req,res,next)=>{
        if(!roles.include(req.user.role)){
            return res.status(403).send('Forbidden');
        }

        next();
    }
}

module.exports={authenticate,authorize,generateToken};