import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// Auth routes
import registerRouter from './auth/register.js'
import loginRouter from './auth/login.js'
import updatePasswordRouter from './auth/update-password.js'

// Resource routes
import tasksRouter from './tasks/index.js'
import taskByIdRouter from './tasks/_id.js'
import projectsRouter from './projects/index.js'
import projectByIdRouter from './projects/_id.js'
import categoriesRouter from './categories/index.js'
import categoryByIdRouter from './categories/_id.js'
import usersRouter from './users/index.js'

const app = express()

app.use(cors())
app.use(express.json())

// Auth
app.use('/api/auth/register', registerRouter)
app.use('/api/auth/login', loginRouter)
app.use('/api/auth/update-password', updatePasswordRouter)

// Resources
app.use('/api/tasks', tasksRouter)
app.use('/api/tasks', taskByIdRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/projects', projectByIdRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/categories', categoryByIdRouter)
app.use('/api/users', usersRouter)

// Export for Vercel serverless
export default app
