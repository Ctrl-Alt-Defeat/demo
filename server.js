'use strict';
const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
const superagent = require('superagent');
const pg = require('pg');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const port = process.env.PORT || 3000;

// ======================= Acconut page geting from database=====================
app.get('/login/acconut', handleAcconutPage);

function handleAcconutPage(req, res) {
  let id = req.params.id;
  console.log(id);
  let selectFromDB = 'SELECT * FROM user WHERE id=$1;';
  //   console.log('DB',selectFromDB);
  let safeValue = [id];
  client.query(selectFromDB, safeValue).then(data => {
    res.render('/public/acconut', { data: data.rows[0] });
    console.log(data.rows[0]);
  }).catch(error => {
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });



}

// {{{{{login}}}}}________________________
app.get('/', (req, res) => {
  res.render('pages/login')
})

app.post('/loginn', (req, res) => {
  let quer = req.body;
  let SQL = 'SELECT * FROM users WHERE email = $1 and password = $2 ;';
  let safevalue = [quer.username, quer.password];

  client.query(SQL, safevalue).then(data => {

    res.render('pages/error', { data: data.rows[0] });

  }).catch(error => {
    console.log('you have error' + error)
  })



})

// ======================= Contact Us Page =====================
app.get("/contact", handleContactPage);
function handleContactPage(req, res) {
  res.render("pages/contact")
}
app.post("/contact", handleContactUsForm);
function handleContactUsForm(req, res) {
  let userName = req.body.userName;
  let email = req.body.email;
  // let text = req.body.text;
  let selectSql = "SELECT username, email FROM users;";
  client.query(selectSql).then(table => {
    table.rows.forEach(oneUser => {
      if (oneUser.username === userName && oneUser.email === email) {

        let SQL = `INSERT INTO contact (mess) VALUES ($1);`
        let safeValue = [req.body.text];
        client.query(SQL, safeValue)
          .then(() => {
            res.render("index")
          }).catch(error => {
            res.render("pages/error", { error: error });
          })
      }
    });

  }).catch(error => {
    res.render("pages/error", { error: error });
  })
}

// {{{{{}}}}}____________________________
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, });
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));
// const port = process.env.PORT || 3000;


// function handelError(res, error) {
//   res.render('pages/error', { error: error });
// }


client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
});
