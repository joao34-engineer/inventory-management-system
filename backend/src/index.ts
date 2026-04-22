import './env.ts'
import { app } from './server.ts'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

