const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const PORT = process.env.PORT

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(cookieParser());

app.use('/api/user', require("./routes/users"));
app.use('/api/employees', require("./routes/employees"));
app.use('/api/products', require("./routes/products"));
app.use('/api/cart', require("./routes/cart"));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
