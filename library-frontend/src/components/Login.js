import { useEffect, useState } from "react";
import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client";

const Login = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, result] = useMutation(LOGIN);
  const handleSubmit = async (event) => {
    event.preventDefault();
    await login({ variables: { username, password } });
    
  }
  useEffect(() => {
      if(result.data) {
          setToken(result.data.login.value);
          localStorage.setItem("cur-user-token", result.data.login.value);
          setPage("books");
      }
  }, [result.data]);
  if (!show) return null;
  return (
    <div>
      <div>
        <h2>login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            username
            <input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
            type={"password"}
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
