import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"

const Authors = ({show}) => {
  const {loading, error, data} = useQuery(ALL_AUTHORS, {
    fetchPolicy: "cache-and-network"
  })
  const authors = data ? data.allAuthors : [];
  console.log(authors)
  const [updateAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })
  if(loading) return <div>loading...</div>;
  if(error) return <div>{error.message}</div>;
  if (!show) {
    return null
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = event.target.name.value
    const born = parseInt(event.target.born.value)
    await updateAuthor({ variables: { name, setBornTo: born }});
    event.target.born.value = '';
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={handleSubmit}>
        <div>
          name
          <select name="name">
            {authors.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
          </div>
          <div>
          born<input name="born"/>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
