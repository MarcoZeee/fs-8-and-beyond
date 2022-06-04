import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries";


const Books = ({show}) => {
  const {loading, error, data} = useQuery(ALL_BOOKS);
  const books = data ? data.allBooks : [];
  if(loading) return <div>loading...</div>
  if (!show) {
    return null
  }
  return (
    <div>
      <h2>books</h2>

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
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
