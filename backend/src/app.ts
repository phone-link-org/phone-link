import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'

dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:5173', // 프론트 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // 필요한 경우 쿠키 포함 허용
  }))
app.use(express.json())
app.use('/api', routes)

export default app
