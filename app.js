const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const app = express();
const User = require('./models/User');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');


// Add i18next middleware

// Other middleware and routes
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: 'your-secret-key', // Replace with a secure key
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: 'en', // Default language
        backend: {
            loadPath: __dirname + '/locales/{{lng}}/translation.json', // Path to language files
        },
        detection: {
            order: ['querystring', 'cookie'], // Detect language from query string or cookie
            caches: ['cookie'], // Cache language in cookies
        },
    });

// Use i18next middleware
app.use(middleware.handle(i18next));

const createAdminUser = async () => {
    const adminUsername = 'grigoriizhebakhanov'; // Replace with your name
    const adminPassword = '1234'; // Replace with a secure password

    const adminUser = await User.findOne({ username: adminUsername });

    if (!adminUser) {
        const newAdmin = new User({
            username: adminUsername,
            password: adminPassword,
            role: 'admin',
        });
        await newAdmin.save();
        console.log('Admin user created successfully.');
    }
};
mongoose.connection.once('open', () => {
    createAdminUser();
});
app.post('/set-language', (req, res) => {
    const { language } = req.body;
    req.session.language = language; // Store selected language in session
    res.redirect('back'); // Redirect back to the previous page
});
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', apiRoutes);


app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/weather');
    } else {
        res.redirect('/login');
    }
});

app.get('/weather', requireAuth, (req, res) => {
    res.render('weather', { weather: null, error: null, user: req.session.user || null });
});

app.post('/weather', requireAuth, (req, res) => {
});

app.get('/api1', requireAuth, (req, res) => {
    res.render('api1', { pokemon: null, error: null, user: req.session.user || null });
});

app.post('/api1', requireAuth, (req, res) => {
});

app.get('/api2', requireAuth, (req, res) => {
    res.render('api2', { card: null, error: null, user: req.session.user || null });
});

app.post('/api2', requireAuth, (req, res) => {
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));