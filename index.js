require('dotenv').config();

const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');

const authRoutes = require('./server/routes/auth.route');
const errorMiddleware = require('./server/middlewares/error.middleware');
const PORT = process.env.PORT ?? 8000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

app.listen(PORT, () => `Server has been started on PORT ${PORT}`);