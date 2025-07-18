import { Router } from 'express'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

router.get('/good', (req, res) => {
  res.send('Good')
})

export default router
