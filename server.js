const express = require('express');
const connectDb = require('./config/db')

const app = express();

// connect db
connectDb();

// Init middle ware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API test'));

// define routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started ${PORT}`));