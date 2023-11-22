const express = require('express');
const sessions = require('express-session');
const app = express();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  //XAMPP ''
    database: 'kjarosz02',  //db is the name of your database
    port: '3306',  //XAMPP  port: '3306'
    multipleStatements: true,
});

db.connect((err) => {
    if (err) return console.log(err.message);
    console.log("connected to local mysql db");
});

const hour = 1000 * 60 * 60;

app.use(sessions({
    secret: "thisismysecrctekey599",
    saveUninitialized: true,
    cookie: { maxAge: hour },
    resave: false
}));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/news', (req, res) => {
    const readartilces = `SELECT * FROM it_articles`;
    db.query(readartilces, (err, results) => {
        res.render('articles', { news: results });
    });
});

app.get('/login', (req, res) => {
    res.render('log');
});

app.post('/login', (req, res) => {

    const email_data = req.body.email_field;
    const checkwriter = `SELECT * FROM it_writers
                            WHERE email = '${email_data}';`;

    db.query(checkwriter, (err, results) => {

        if (err) throw err;
        if (results.length > 0) {
            const userID = results[0].id;
            req.session.userId = userID;
            //res.send(`user is on system with ID ${userID}`);
            res.redirect('/profile');
        } else {
            res.send(`no user with that email exists`);
        }
    });
});

app.get('/profile', (req, res) => {

    const uid = req.session.userId;

    const writereadsql = `SELECT * FROM it_articles 
                            WHERE writer_id = '${uid}';
                            SELECT * FROM it_writers 
                            WHERE id =  '${uid}';`;

    db.query(writereadsql, (err, results) => {

        if (err) throw err;
        res.render('writer_articles', { news: results[0], writer: results[1] });

    });

    //res.send(`user id is: ${writereadsql}`);

});

app.get('/create', (req, res) => {
    res.render('addarticle');
});

app.post('/create', (req, res) => {
    const head_data = req.body.head_field;
    const topic_data = req.body.topic_field;
    const article_data = req.body.article_field;

    const uid = req.session.userId; // data not from form but the SESSION that was created on LOGIN

    const addarticlesql = `INSERT INTO it_articles (headline, topic, article_data, writer_id)
                                   VALUES ('${head_data}', '${topic_data}', '${article_data}', '${uid}'); `;

    db.query(addarticlesql, (err, results) => {

        if (err) throw err;
        res.send(results);
    });

    
});

app.listen(3000, () => {
    console.log(`Server Running at port 3000`)
});