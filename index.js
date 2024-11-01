const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))


const USERS = []
const EXERCISES = [] 

app.get('/', (req, res) => { res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', (req, res, next) => {
	let user = {}
	user._id = uuidv4()
	user.username = req.body.username
	USERS.push(user)
	res.json(user)
})

app.get('/api/users', (req, res) => {
	res.send(USERS)
})

//app.post('/api/users/:_id/exercises', (req, res, next) => {
//    const userId = req.params._id;  // Get the user ID from params
//    const exercise = req.body;      // Get the exercise data from the request body
//
//    // Find the user by ID
//    const user = USERS.find(user => user._id === userId);
//
//    if (!user) {
//        // If user is not found, return an error response
//        return res.status(404).send('Invalid user id, user does not exist!!');
//    }
//
//    // Exclude ':_id' from exercise if it's present
//    let { [':_id']: _, ...exerciseData } = exercise;
//
//    // Merge the new exercise data into the user object
//    Object.assign(user, exerciseData);
//
//    // Return the updated user object as the response
//    return res.json(user);  // `json` is better when sending an object response
//});


app.post('/api/users/:_id/exercises', (req, res, next) => {
    let userId = req.params._id
    let userFound = false;
    let exercises = []

    for (let user of USERS) {
        if (user._id === userId){
            let exercise = req.body;
            let { [':_id']: _, ...rest } = exercise;
	    exercises.push(rest)
	    user.exercises = exercises
            res.json(user);
            userFound = true;
            break; 
        }
    }
   if (!userFound) {
        res.status(404).send('Invalid user id, user does not exist!!');
    }
});

app.get('/api/users/:_id/logs', (req, res) => {
	let userId = req.params._id
	let user = USERS.find(user => user._id === userId)
	let count = 0
	let log = []
	for (let exercise of EXERCISES){
		if(userId === exercise[':_id']){
			count += 1
			let {[':_id']:_, ...rest} = exercise
			log.push(rest)
			continue
		}
	}
	if(count > 0){
		user.log = log
		user.count = count
		res.json({user})
	}else{
		res.json({message: 'No logs on requested user'})
	}
})
			
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
