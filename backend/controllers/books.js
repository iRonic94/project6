const book = require('../models/book');
const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  try {
    if (!req.body.book) {
      throw new Error("Missing book data");
    }

    if (!req.file) {
      throw new Error("Missing image file");
    }
    //we want to parse the book obj to turn into json obj
    const parsedBook = JSON.parse(req.body.book);
    //build URL
    const url = req.protocol + '://' + req.get('host');
    const book = new Book({
      userId: req.auth.userId,
      title: parsedBook.title,
      author: parsedBook.author,
      imageUrl: url + '/images/' + req.file.filename,
      year: Number(parsedBook.year),
      genre: parsedBook.genre,
      ratings: [],
      averageRating: 0
    });
    book.save()
      .then(() => {
        res.status(201).json({
          message: 'Book saved successfully!'
        });
      })
      .catch((error) => {
        console.log("Book not saved!");
        res.status(400).json({
          error: new Error("Book not saved!")
        });
      });

  } catch (error) {
    console.log("post didn't work");
    res.status(400).json({
      error: new Error("Creation failed!")
    });
  }
};
exports.ratedBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({
        error: 'There is no book'
      });
    }
    //duplication check
    if (book.ratings.find(r => r.userId === req.auth.userId)) {
      return res.status(400).json({
        error: 'This user already rated'
      })
    }
    //validate rating
    const rating = Number(req.body.rating);
    if (req.body.rating < 0 || req.body.rating > 5) {
      return res.status(400).json({
        error: 'Rating must be between 0 and 5'
      });
    }

    book.ratings.push({
      userId: req.auth.userId,
      grade: Number(req.body.rating)
    });
    //calculate the average rating
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = total / book.ratings.length;

    return book.save().then(() => {
      res.status(200).json(book);
    });

  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
}
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
    //we want to parse the book obj to turn into json obj
    const parsedBook = JSON.parse(req.body.book);
    //build URL
    const url = req.protocol + '://' + req.get('host');
    book = {
      userId: req.auth.userId,
      title: parsedBook.title,
      author: parsedBook.author,
      imageUrl: url + '/images/' + req.file.filename,
      year: Number(parsedBook.year),
      genre: parsedBook.genre
    };
  } else {
    book = {
      userId: req.auth.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: Number(req.body.year),
      genre: req.body.genre
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
        error: 'Book not updated!'
      });
    }
  );
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then(
    (book) => {
      if (!book) {
        return res.status(404).json({
          error: 'There is no book'
        });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(400).json({
          erorr: 'Unauthorized request!'
        });
      }
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          console.log("File deleted error", error);
        }
      });
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
  ).catch((error) => {
    console.error("GET ALL BOOKS ERROR:", error);
    res.status(500).json({
      error: error.message
    });
  });
};

exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch((error) => {
      console.error("GET BEST 3 BOOKS ERROR:", error);
      res.status(500).json({
        error: error.message
      });
    });
};