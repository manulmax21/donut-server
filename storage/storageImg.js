const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Убедитесь, что папка существует или создайте её
        cb(null, path.join(__dirname, '../uploads')); // Папка для сохранения загруженных файлов
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});
const uploadStorageImage = multer({ storage: storage });

module.exports = {
    uploadStorageImage
}