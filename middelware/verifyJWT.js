const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded.userInfo.id; // تخزين بيانات المستخدم في الطلب
        next();
    } catch (error) {
        res.status(403).json({ message: "Forbidden" });
    }
};

module.exports = verifyJWT;
