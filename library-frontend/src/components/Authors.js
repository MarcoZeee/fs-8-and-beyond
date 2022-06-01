import { useQuery } from "@apollo/client"

const Authors = ({rawData, show}) => {
  const {loading, error, data} = useQuery(rawData)
  const authors = data ? data.allAuthors : []
  if(loading) return <div>loading...</div>
  if (!show) {
    return null
  }
  console.log({authors})

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
              <td>{a?.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
