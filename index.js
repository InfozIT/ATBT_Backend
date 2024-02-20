const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('./models')
const Entite_router = require('./Routes/Entity')
const Toggle_router = require('./Routes/Toggle')
const emailRoute = require('./mail/mail')
const Auth_router = require('./Routes/Auth')
const User_router = require('./Routes/User')
const Role_router = require('./Routes/Role')
const Team_router = require('./Routes/Team')
const Meeting_router = require('./Routes/Meeting')
const CreateForm_router = require("./Routes/CreateForm")
const Form_router = require('./Routes/Form')
const errorHander = require('./middlewares/errorHandler.middleware')
const routeNotFound = require('./middlewares/routeNotfound.middleware')
const authVerify = require('./middlewares/authVerify.middleware')
const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/entity', authVerify, Entite_router);
app.use('/user', User_router);
app.use('/team', Team_router);
app.use('/auth', Auth_router);
app.use('/form', CreateForm_router);
app.use('/Custom', Form_router);
app.use('/meeting', Meeting_router);
app.use('/toggle', Toggle_router);
app.use('/rbac', Role_router);
app.use('/api', authVerify, emailRoute);
app.use('/profile', express.static('Public/Images'));

app.get('/', (req, res) => {
  res.send("API From Cus")
})
app.use(errorHander);
app.use(routeNotFound);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})