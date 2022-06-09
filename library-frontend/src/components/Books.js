import { useQuery } from "@apollo/client";
import {ALL_BOOKS } from "../queries";
import { useState, useEffect } from "react";

const Books = ({ show }) => {
  const [activeGenre, setActiveGenre] = useState(null);
  const [books, setBooks] = useState([]);
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { genre: activeGenre },
    fetchPolicy: "cache-and-network"
  });
  const rawBooks = data ? data.allBooks : [];
  const rawGenres = rawBooks.map((b) => b.genres).flat();
  const genres = [...new Set(rawGenres)];
  useEffect(() => {
    setBooks(rawBooks);
  }, [data]);
  if (loading) return <div>loading...</div>;
  if (error) return <div>error: {error.message}</div>;
  if (!show) {
    return null;
  }
  return (
    <div>
      <h2>books</h2>
      <div>
        in genre{" "}
        <b>
          {activeGenre ? activeGenre : `all`}
          {` `}
        </b>
        <button onClick={() => setActiveGenre(null)}>see all</button>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((g) => (
        <button
          key={g}
          onClick={(e) => {
            setActiveGenre(g);
          }}
        >
          {g}
        </button>
      ))}
    </div>
  );
};

export default Books;
