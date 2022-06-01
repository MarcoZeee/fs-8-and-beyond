import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql } from '@apollo/client'

const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`;
const ALL_BOOKS = gql`
query {
  allBooks {
    title
    author 
    published
    genres
  }
}
`

const ADD_BOOK = gql`
  mutation addBook($author: String!, $title: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      author: $author
      title: $title
      published: $published
      genres: $genres
    ) {
      title
      author
      published
      genres
    }

  }
`

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors rawData={ALL_AUTHORS} show={page === 'authors'} />

      <Books rawData={ALL_BOOKS} show={page === 'books'} />

      <NewBook rawData={ADD_BOOK} show={page === 'add'} />
    </div>
  )
}

export default App
