const express = require("express");
const morgan = require("morgan");
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const { resolveSoa } = require("dns");
const { result } = require("lodash");

const dbURL = process.env.dbURL;
const port = 3030;

// connect to mongoDB 
// listen for requests 
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then((result) => {
    console.log('mongo ✅');
    app.listen(port);
    console.log(`${port} ✅`);
})
.catch((err) => {
    console.log(err);
});

// express app
const app = express();

// view engine 
app.set('view engine', 'ejs');

// statis files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// middleware
app.use(morgan('dev'));



app.get('/', (req, res) => {
    Blog.find().sort({ date: -1 })
    .then(result => {
        res.render('pages/home', { blogs: result, title: 'All Blogs' });
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/create-blog', (req, res) => {

    res.render('pages/create', { title: 'Create Blog' });

});

app.post('/create-blog', (req, res) => {
    if (req.body.date === null) {
        req.body.date = new Date().toLocaleDateString('ru-RU');
    }

    const blog = new Blog(req.body);
        blog.save()
        .then(result => {
            res.redirect(`/${result.slug}/view`);
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/:slug/view', (req, res) => {
    Blog.findOne({slug: req.params.slug})
    .then(result => {
        if (result === null) {
            res.redirect('/');
        } else {
            if (result.date === null) {
                res.render('pages/blog', { blogs: result, title: `Blog | ${result.createdAt.toLocaleDateString('ru-RU')}` });
            }
            else {
                res.render('pages/blog', { blogs: result, title: `Blog | ${result.date.toLocaleDateString('ru-RU')}` });
            }
        }
    })
    .catch(err => {
        console.log(err);
    });
});

// app.get('/:slug/edit', (req, res) => {
//     Blog.findOne({slug: req.params.slug})
//     .then(result => {
//         if (result === null) {
//             res.status(404).render('pages/404', { title: 'Page Not Found' });
//         } else {
//             res.render('pages/edit', { blogs: result, title: 'Edit Blog' });
//         }
//     })
//     .catch(err => {
//         console.log(err);
//     });
// });

// app.put('/edit-blog', (req, res) => {
//     res.send('Got PUT request');
// });

// app.get('/:slug/delete', (req, res) => {
//     Blog.findOneAndDelete({slug: req.params.slug})
//     .then(result => {
//         if (result === null) {
//             res.redirect('/');
//         } else {
//             res.redirect('/');
//         }
//     })
//     .catch(err => {
//         console.log(err);
//     });
// });

app.use((req, res) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
});
