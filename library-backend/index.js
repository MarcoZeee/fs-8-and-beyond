const { ApolloServer, UserInputError, AuthenticationError, gql } = require("apollo-server");
const mongoose = require("mongoose");
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'pass123'
const MONGODB_URI = `mongodb+srv://master:master321@cluster0.m48hu.mongodb.net/fs-8+?retryWrites=true&w=majority`;


console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then( () => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  });



/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */


const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    books: [Book!]
    bookCount: Int!
    born: Int
    id: ID!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

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
      if(args.author && args.genre) {
        return books.filter(book => (book.genres.includes(args.genre)) && book.author.name === args.author);
      }
      return books;
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      console.log(authors);
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
};
const context = async ({ req }) => {
  const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.slice(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
}
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
