import ReactDOM from "react-dom";
import App from "./App";
import { setContext } from '@apollo/client/link/context'

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@apollo/client'


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('cur-user-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null
}}});

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

ReactDOM.render(
<ApolloProvider client={client}>
    <App />
</ApolloProvider>, 
document.getElementById("root"));

