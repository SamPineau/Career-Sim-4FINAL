const {
  client,
  createTables,
  createUser,
  fetchUsers,
  authenticate,
  findUserWithToken,
  updateUserNum,
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

const path = require('path');
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));
app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets'))); 

const isLoggedIn = async(req, res, next)=> {
  try{
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  }
  catch(ex){
    next(ex);
  }
};

app.patch("api/users/favnum", isLoggedIn, async(req, res, next)=>{
  try{
    console.log(req.headers.authorization);
    console.log(req.body.number);

    const user = await findUserWithToken(req.headers.authorization);
    await updateUserNum(user.id, req.body.number);
    res.send({message:"success", number: req.body.number})
  }catch(ex){
    next(ex);
  }
})

app.post('/api/auth/register', async(req, res, next)=> {
  try {

    const newUser = await createUser(req.body);
    res.send(await authenticate(req.body));
  }
  catch(ex){
    console.log("ERROR IN SERVER REGISTER ROUTE")
    next(ex);
  }
});

app.post('/api/auth/login', async(req, res, next)=> {
  try {
    res.send(await authenticate(req.body));
  }
  catch(ex){
    console.log("ERROR IN SERVER LOGIN ROUTE")
    next(ex);
  }
});

app.get('/api/auth/me', isLoggedIn, (req, res, next)=> {
  try {
    res.send(req.user);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message ? err.message : err });
});

const init = async()=> {
  const port = process.env.PORT || 3000;
  await client.connect();
  console.log('connected to database');

  await createTables();
  console.log('tables created');

  const [moe, lucy, ethyl, curly] = await Promise.all([
    createUser({ username: 'moe', password: 'm_pw', favoriteNum:6}),
    createUser({ username: 'lucy', password: 'l_pw'}),
    createUser({ username: 'ethyl', password: 'e_pw', favoriteNum:4}),
    createUser({ username: 'curly', password: 'c_pw'})
  ]);

  console.log(await fetchUsers());

  await updateUserNum(curly.id, 3)
  console.log(await fetchUsers());

  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();

