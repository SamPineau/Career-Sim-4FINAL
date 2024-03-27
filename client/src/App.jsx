import { useState, useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom';

const Login = ({ login })=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasERROR] = useState(false);

  const submit = async(ev) => {
    ev.preventDefault();
    try{
    await login({ username, password });
  }catch(ex){
    console.log(ex);
    setHasError(True);
  }
  }
  return (
    <form onSubmit={ submit }>
      {hasError && <p>Wrong credentials, try again.</p>}
      <input value={ username } placeholder='username' onChange={ ev=> setUsername(ev.target.value)}/>
      <input value={ password} placeholder='password' onChange={ ev=> setPassword(ev.target.value)}/>
      <button disabled={ !username || !password }>Login</button>
    </form>
  );
}


const Register = ({ register })=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasERROR] = useState(false);

  const submit = async(ev) => {
    ev.preventDefault();
    try{
    await register({ username, password });
  }catch(ex){
    console.log(ex);
    setHasError(True);
  }
  }
  return (
    <form onSubmit={ submit }>
      {hasError && <p>Wrong credentials, try again.</p>}
      <input value={ username } placeholder='username' onChange={ ev=> setUsername(ev.target.value)}/>
      <input value={ password} placeholder='password' onChange={ ev=> setPassword(ev.target.value)}/>
      <button disabled={ !username || !password }>Register</button>
    </form>
  );
}
function App() {
  const [auth, setAuth] = useState({});
  const [favNum, setFavNum] = useState(5);

  useEffect(()=> {
    attemptLoginWithToken();
  }, []);

  const attemptLoginWithToken = async()=> {
    const token = window.localStorage.getItem('token');
    if(token){
      const response = await fetch(`/api/auth/me`, {
        headers: {
          authorization: token
        }
      });
      const json = await response.json();
      if(response.ok){
        setAuth(json);
        setFavNum(json["favorite_number"])
      }
      else {
        window.localStorage.removeItem('token');
      }
    }
  };

  const register = async(credentials)=> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const json = await response.json();
    console.log(jsone);
    if(response.ok){
      window.localStorage.setItem('token', json.token);
      attemptLoginWithToken();
    }
    else {
      throw json;
    }
  };

  const login = async(credentials)=> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const json = await response.json();
    if(response.ok){
      window.localStorage.setItem('token', json.token);
      attemptLoginWithToken();
    }
    else {
      throw json;
    }
  };

  const logout = ()=> {
    window.localStorage.removeItem('token');
    setAuth({});
  };

  const handleNumChange = async (ev)=>{
    const token = window.localStorage.getItem("token");
    const response = await fetch('/api/users/favnum', {
      method: 'PATCH',
      body: JSON.stringify({number: ev.target.value}),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    });
    const json = await response.json();
    console.log(json);
    if(json.message === "success"){
      setFavNum(json.number);
    }
  };

  return (
    <>
      {
        !auth.id ? <>
          <Login login={ login }/>
          <Register register={register}/>
          </>
        : <button onClick={ logout }>Logout { auth.username }</button>
      }
      {
        !!auth.id && (
          <nav>
            <Link to='/'>Home</Link>
            <Link to='/faq'>FAQ</Link>
          </nav>
        )
      }
{
  !!auth.id &&(
    <>
    <p>Current Favorite Number: {favNum}</p>
    <select onChange={handleNumChange} value={favNum}>
      <option>Please select a new favorite number, if you would like!</option>
      {[1,2,3,4,5,6,7,8,9,10].map(num=><option val={num}>{num}</option>)}
    </select></>
    
  )
}

      {
        !!auth.id && (
          <Routes>
            <Route path='/' element={<h1>Home</h1>} />
            <Route path='/faq' element={<h1>FAQ</h1>} />
          </Routes>
        )
      }
    </>
  )
}

export default App
