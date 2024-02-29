const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path');
require('./models')
const Entite_router = require('./Routes/Entity')
const Toggle = require('./Controllers/toggle')
const emailRoute = require('./mail/mail')
const Auth_router = require('./Routes/Auth')
const User_router = require('./Routes/User')
const Role_router = require('./Routes/Role')
const Team_router = require('./Routes/Team')
const Meeting_router = require('./Routes/Meeting')
const CreateForm_router = require("./Routes/CreateForm")
const errorHander = require('./middlewares/errorHandler.middleware')
const routeNotFound = require('./middlewares/routeNotfound.middleware')
const authVerify = require('./middlewares/authVerify.middleware')
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/entity', authVerify, Entite_router);
app.use('/user', authVerify, User_router);
// app.use('/entity',Entite_router);
// app.use('/user',User_router);
app.use('/team', Team_router);
app.use('/auth', Auth_router);
app.use('/form', CreateForm_router);
app.use('/meeting', Meeting_router);
app.use('/rbac', Role_router);
app.use('/api', authVerify, emailRoute);
// app.use('/profile', express.static('Public/Images'));
const imagesFolder = path.join(__dirname, 'Public', 'logo');
app.use('/images', express.static(imagesFolder));

app.get('/', (req, res) => {
  res.send("mailer done")
})

app.put('/toggle/:id', Toggle.Add_toggle)

app.use(errorHander);
app.use(routeNotFound);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
