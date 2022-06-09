import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = ({ show }) => {
  const { loading, error, data } = useQuery(ALL_BOOKS);
  const user = useQuery(ME);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  if(error) return <div>{error.message}</div>
  const books = data ? data.allBooks : [];
  const recommendedBooks = books.filter((e) =>
    e.genres.includes(user.data.me.favouriteGenre)
  );
  return (
    <>
      <h2>recommendations</h2>
      <div>books in your favourite genre {}</div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {recommendedBooks.map((a) => {
            return (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
export default Recommendations;
