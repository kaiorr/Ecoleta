import express from "express"

const routes = express.Router()

routes.get('/', (req, res) => {
  return res.json({ messsage: 'Hello World' })
})

export default routes