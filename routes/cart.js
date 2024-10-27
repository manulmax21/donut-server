const express = require('express');
const router = express.Router();
const {getAll, addCart, removeOneCart} = require("../controllers/cart");
const {uploadStorageImage} = require("../storage/storageImg");

router.get("/", getAll);
router.post("/add", addCart);
router.post("/:id", removeOneCart);

module.exports = router;