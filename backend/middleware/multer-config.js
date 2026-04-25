const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//how to save the file
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        //2 args: first if we received an error or not, folder which we want to save the file
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        //parse the file path and extract the filename without extension
        const name = path.parse(file.originalname).name.split(' ').join('');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + '.' + extension);
    }
});

//saving in storage and capture one single file
module.exports = multer({ storage: storage }).single('image');