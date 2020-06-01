import express from "express"

const app = express()

app.get('/users', (req, res) => {
  console.log('listagem de Users')

  res.json([
    'Kaio',
    'Linux'
  ])
})

app.listen(3333)  