const Book = require('../models/book');

exports.createBook = (req, res, next) => {
  //we want to get the stringified book and parse to turn into json obj
  req.body.book = JSON.parse(req.body.book)
  //build URL
  const url = req.protocol + '://' + req.get('host');
  const book = new Book({
    userId: req.auth.userId,
    title: req.body.book.title,
    author: req.body.book.author,
    imageUrl: url + '/images/' + req.file.filename,
    year: Number(req.body.book.year),
    genre: req.body.book.genre,
    ratings: [
      {
        userId: req.auth.userId,
        grade: Number(req.body.book.grade)
      }
    ],
    averageRating: Number(req.body.book.averageRating)
  });
  book.save().then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyBook = (req, res, next) => {
  //creating new book will create new id so we will pass the id 
  let book = new Book({ _id: req.params.id });
  //check if there is a file with the request
  if (req.file) {
    //we want to get the stringified book and parse to turn into json obj
    req.body.book = JSON.parse(req.body.book)
    //build URL
    const url = req.protocol + '://' + req.get('host');
    book = {
      //pass the same id
      _id: req.params.id,
      userId: req.auth.userId,
      title: req.body.book.title,
      author: req.body.book.author,
      imageUrl: url + '/images/' + req.file.filename,
      year: Number(req.body.book.year),
      genre: req.body.book.genre,
      ratings: [
        {
          userId: req.auth.userId,
          grade: Number(req.body.book.grade)
        }
      ],
      averageRating: Number(req.body.book.averageRating)
    };
  } else {
    book = {
      _id: req.params.id,
      userId: req.auth.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: Number(req.body.year),
      genre: req.body.genre,
      ratings: [
        {
          userId: req.auth.userId,
          grade: Number(req.body.grade)
        }
      ],
      averageRating: Number(req.body.averageRating)
    };
  }
  Book.updateOne({ _id: req.params.id }, book).then(
    () => {
      res.status(201).json({
        message: 'Book updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then(
    (book) => {
      if (!book) {
        return res.status(404).json({
          error: new Error('There is no book')
        });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(400).json({
          erorr: new Error('Unauthorized request!!!')
        });
      }
      Book.deleteOne({ _id: req.params.id }).then(
        () => {
          res.status(200).json({
            message: 'Deleted!'
          });
        }
      ).catch(
        (error) => {
          res.status(400).json({
            error: error
          });
        }
      );
    }
  )
};


exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};
