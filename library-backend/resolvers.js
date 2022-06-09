const { UserInputError, AuthenticationError} = require("apollo-server");
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const JWT_SECRET = 'pass123'

const resolvers = {
    Query: {
      bookCount: async ()=> Book.collection.countDocuments(),
      authorCount: async ()=> Author.collection.countDocuments(),
      allBooks: async (root, args) => {
        const books = await Book.find({}).populate('author');
        if (args.author) {
          return books.filter(book => book.author.name === args.author);
        }
        if (args.genre) {
          return books.filter(book => book.genres.includes(args.genre));
        }
        if(args.genre && args.author) {
          return books.filter(book => (book.genres.includes(args.genre)) && book.author.name === args.author);
        }
        return books;
      },
      allAuthors: async () => {
        const authors = await Author.find({}).populate('books');
        return authors;
      },
      me: async (root, args, { currentUser }) => {
        if (!currentUser) {
          return null;
        }
        return currentUser;
      }
    },
    Author: {
      books: async (root) => await Book.find({author: root.id}),
      bookCount: async (root) => await Book.find({author: root.id}).countDocuments(), 
    },
    Mutation: {
      addBook: async (root, args, {currentUser}) => {
        if(!currentUser) throw new AuthenticationError('not authenticated')
        let author = await Author.findOne({name: args.author});
        if (!author) {
          author = await new Author({name: args.author, born: args.born}).save();
          await author.save();
        } 
        const book = new Book({
          ...args,
          author,
        });
        try {
          await book.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
        });
      }    
        pubsub.publish('BOOK_ADDED', { bookAdded: book });

        return book;
      },
      editAuthor: async (root, args, {currentUser}) => {
        if(!currentUser) throw new AuthenticationError('not authenticated')
        const author = await Author.findOne({ name: args.name });
        author.born = args.setBornTo;
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return author;
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username })
    
        return user.save()
          .catch(error => {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          })
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'pass123' ) {
          throw new UserInputError("wrong credentials")
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, JWT_SECRET) }
      },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
  };

  module.exports = resolvers;