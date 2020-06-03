import express from "express"
import knex from './database/connection'

const routes = express.Router()

routes.get('/itens', async (req, res) => {
  const itens = await knex('itens').select('*')

  const serializedItens = itens.map(item => {
    return {
      id: item.id,
      name: item.name,
      image_url: `http://localhost:3333/uploads/${item.image}`,
    }
  })

  return res.json(serializedItens)
})

routes.post('/points', async (req, res) => {
  const {
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
    itens
  } = req.body

  await knex('points').insert({
    image: 'image-fake',
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf
  })

  const pointItens = itens.map((item_id: number) => {
    return {
      item_id,
      point_id: ids[0],
    }
  })

  await knex('point_itens').insert(pointItens)

  return res.json({ success: true })
})

export default routes