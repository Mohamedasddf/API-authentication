const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // التحقق مما إذا كان المستخدم موجودًا بالفعل
        const foundUser = await User.findOne({ email }).exec();
        if (foundUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم الجديد
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
        });

        // إنشاء Access Token و Refresh Token
        const accessToken = jwt.sign(
            { userInfo: { id: newUser._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m"}
        );

        const refreshToken = jwt.sign(
            { userInfo: { id: newUser._id } },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // إعداد الكوكيز
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // إرسال الاستجابة
        res.json({
            accessToken,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // مقارنة كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // إنشاء Access Token و Refresh Token
        const accessToken = jwt.sign(
            { userInfo: { id: user._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userInfo: { id: user._id } },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );


        // إعداد الكوكيز
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // إرسال الاستجابة
        res.json({
            accessToken,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



const refresh = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

        const refreshToken = cookies.jwt;
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const foundUser = await User.findById(decoded.userInfo.id).exec();
        if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

        const accessToken = jwt.sign(
            { userInfo: { id: foundUser._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid Token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token Expired" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const logout = (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    res.status(204).send(); // 204 تعني "No Content"
};


const getAllUsers =  async (req, res) => {
    try {
        const users = await User.find().select("first_name last_name email"); // يجلب جميع المستخدمين
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};


module.exports = { register,login, getAllUsers , refresh, logout };

