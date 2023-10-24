require('dotenv').config()

const app = require('./src/app');

const { PORT } = require('./src/common');

const connectToDatabase = require('./src/mongo');

connectToDatabase()  
    .then(() => {
        app.listen(PORT, () => {
            console.log(`WebSocket Server is listening at http://localhost:${ PORT }`);
        }) 
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    });
