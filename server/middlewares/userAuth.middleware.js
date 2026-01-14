import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies

    if(!token){
        return res.json({ success: false, message: 'Unauthorized access. Login Again'})
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SEC_KEY)

        if(decodedToken.id){
            if(!req.body) req.body = {}
            req.body.userId = decodedToken.id
        }
        else{
            return res.json({ success: false, message: 'Unauthorized access. Login Again'})
        }

        next()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export default userAuth