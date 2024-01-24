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
    const token=req.headers['authorization']

    if(!token){
        res.statusCode=401;
        return res.send('Unauthorized');
    }

    try{
        const decoded=jwt.verify(token,req.authMiddlewareSecretKey || 'default-secret-key');
        req.user=decoded.user;
        next();

    }catch(err){
        res.statusCode=401;
        return res.send('Invalid Token')
    }
}

// authorized function

function authorize(roles){
    return (req,res,next)=>{
        if(!roles.include(req.user.role)){
            res.statusCode=403;
            return res.send('Forbidden');
        }

        next();
    }
}

module.exports={authenticate,authorize,generateToken};