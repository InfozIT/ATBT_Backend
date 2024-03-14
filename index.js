const express = require('express')
require('dotenv').config();
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path');
const upload = require('./utils/store')
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
const port = 3000;


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/entity', authVerify, Entite_router);
app.use('/user', authVerify, User_router);
// app.use('/entity',Entite_router);
// app.use('/user', User_router);
app.use('/team', authVerify, Team_router);
app.use('/auth', Auth_router);
app.use('/form', CreateForm_router);
app.use('/boardmeeting', authVerify, Meeting_router);
app.use('/rbac', Role_router);
app.use('/api', authVerify, emailRoute);



// load Static file
const imagesFolder = path.join(__dirname, 'Public');
app.use('/images', express.static(imagesFolder));

app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file)
  res.status(200).json({
    success: 1,
    profile_url: `${process.env.IMAGE_URI}/images/${req.file.filename}`

  })
});


app.get('/', (req, res) => {
  res.send("feat: Beta22444FDFF")
})
// toggle 
app.put('/toggle/:id', Toggle.Add_toggle)
app.use(errorHander);
app.use(routeNotFound);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
