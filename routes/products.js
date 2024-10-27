const express = require('express');
const router = express.Router();
const {getAll, addProduct, getOneProduct, getPageProduct, addImageProduct} = require("../controllers/products");
const {uploadStorageImage} = require("../storage/storageImg");

router.get("/", getAll);
router.get("/:id", getOneProduct);
router.get("/page/:page", getPageProduct);
router.post("/add", uploadStorageImage.single("image"), addProduct);
router.post("/image", uploadStorageImage.single("image"), addImageProduct);

module.exports = router;