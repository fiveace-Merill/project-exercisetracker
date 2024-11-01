const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const USERS = [];

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
    let user = {
        _id: uuidv4(),
        username: req.body.username,
        exercises: [] // Initialize exercises as an empty array
    };
    USERS.push(user);
    res.json(user);
});

// Get a list of all users
app.get('/api/users', (req, res) => {
    res.json(USERS);
});

// Add an exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    // Find the user by ID
    const user = USERS.find(user => user._id === userId);
    if (!user) {
        return res.status(404).send('Invalid user id, user does not exist!!');
    }

    // Create the exercise object
    const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
    const exercise = {
        description,
        duration: Number(duration), // Ensure duration is a number
        date: exerciseDate // Format date as a string
    };

    // Add the exercise to the user's exercises array
    user.exercises.push(exercise);

    // Return the updated user object with exercises included
    res.json(user);
});

// Get a user's exercise logs with optional filtering
app.get('/api/users/:_id/logs', (req, res) => {
    const userId = req.params._id;
    const user = USERS.find(user => user._id === userId);
    if (!user) {
        return res.status(404).send('Invalid user id, user does not exist!!');
    }

    // Parse query parameters
    const { from, to, limit } = req.query;
    let log = user.exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
    }));

    // Filter by date range if 'from' and 'to' are provided
    if (from || to) {
        log = log.filter(exercise => {
            const exerciseDate = new Date(exercise.date);
            const fromDate = from ? new Date(from) : new Date(0); // Default to the earliest date
            const toDate = to ? new Date(to) : new Date(); // Default to now
            return exerciseDate >= fromDate && exerciseDate <= toDate;
        });
    }

    // Limit the number of logs if 'limit' is provided
    if (limit) {
        log = log.slice(0, Number(limit)); // Ensure limit is an integer
    }

    // Return the user object with logs
    res.json({
        username: user.username,
        count: log.length,
        log: log
    });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
