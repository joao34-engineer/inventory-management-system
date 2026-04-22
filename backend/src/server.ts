import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { isTest } from './env.ts'
import { userRouter } from './modules/user/user.routes.ts'
import { productRouter } from './modules/products/products.routes.ts'
import { categoryRouter } from './modules/categories/categories.routes.ts'
import { errorHandler, NotFoundError } from './shared/middleware/globalError.ts' 

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(morgan('dev', {
  skip: () => isTest()
}))

app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok', timestamp: new Date().toISOString()
  })
})

app.use('/api/products', productRouter)

app.use('/api/user', userRouter)
app.use('/api/categories', categoryRouter)
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`))
})

app.use(errorHandler)

