require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbconn");
const corsOptions = require("./config/corsOptions");
const register = require("./routers/router")
const userRouter = require("./routers/authRouters")
const app = express();

// 🔹 الاتصال بقاعدة البيانات
connectDB();

// 🔹 إعدادات الـ Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// ✅ تحميل الملفات الثابتة بشكل صحيح
app.use(express.static(path.join(__dirname, "public")));

// ✅ تحميل الـ Routes
app.use("/", register);
app.use("/auth", userRouter);

app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', 'notFoundPage.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({ message: 'Page not found' });
    } else {
        res.status(404).type('text').send('Page not found');
    }
});



// ✅ بدء تشغيل السيرفر بعد الاتصال بقاعدة البيانات
mongoose.connection.once("open", () => {
    console.log("✅ Connected To Database");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});

// ✅ التعامل مع أخطاء الاتصال بقاعدة البيانات
mongoose.connection.on("error", (err) => console.log("❌ Database Error:", err));
