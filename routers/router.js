const express = require("express");
const router = express.Router();
const path = require("path");
const app = express();
const indexHtml = path.join(__dirname, '../views/index.html');

router.get("/", (req,res) =>{
    res.sendFile(indexHtml)

});

module.exports = router;