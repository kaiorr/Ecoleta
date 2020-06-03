import express from 'express'
import path from 'path'
import routes from './routes'


const app = express()

app.use(express.json())

app.use(routes)

app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')))

app.listen(3333)