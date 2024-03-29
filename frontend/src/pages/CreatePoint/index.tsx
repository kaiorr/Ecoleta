import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import './style.css'
import logo from '../../assets/logo.svg'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFresponse {
  sigla: string;
}

interface IBGECityresponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [selectedUf, setSeletedUf] = useState('0')

  const [cities, setCities] = useState<string[]>([])
  const [selectedCitie, setSeletedCitie] = useState('0')

  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude} = position.coords

      setInitialPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {
    axios.get<IBGEUFresponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufSiglas = response.data.map(uf => uf.sigla)

      setUfs(ufSiglas)
    })
  }, [])
  //carregar as cidades sempre que usuário mudar a UF
  useEffect(() => {
    if (selectedUf === '0') {
      return
    }

    axios.get<IBGECityresponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(uf => uf.nome)

      setCities(cityNames)
  })
  }, [selectedUf])

  function handleChangeUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value

    setSeletedUf(uf)
  }

  function handleChangeCitie(event: ChangeEvent<HTMLSelectElement>) {
    const citie = event.target.value

    setSeletedCitie(citie)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value} = event.target

    setFormData({...formData, [name]: value})

  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id)

    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)

      setSelectedItems(filteredItems)
    } else {

      setSelectedItems([...selectedItems, id])
    }

  }

 async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const {name, email, whatsapp} = formData
    const uf = selectedUf
    const citie = selectedCitie
    const [latitude, longitude] = selectedPosition
    const items = selectedItems
    const data = {
      name,
      email,
      whatsapp,
      uf,
      citie,
      latitude,
      longitude,
      items
    }

   await api.post('points', data)
   
   //redireciona para home após sobmit do form
   history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link> 
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="text"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>


        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no Mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer 
                attribution='&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Selecione uma UF</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleChangeUf}>
                <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}

              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city"
                id="city"
                value={selectedCitie}
                onChange={handleChangeCitie}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}

              </select>
            </div>
          </div>
        </fieldset>


        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
        </fieldset>
        <ul className="items-grid">
          {items.map(item => (

           <li 
            key={item.id} 
            onClick={() => handleSelectItem(item.id)}
            className={selectedItems.includes(item.id) ? 'selected' : ''}
           >
             <img src={item.image_url} alt={item.title}/>
             <span>{item.title}</span>
           </li>
           
          ))}
        </ul>
      </form>
    </div>
  )
}

export default CreatePoint