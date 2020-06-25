import React, {useEffect, useState, ChangeEvent} from 'react'
import './style.css'
import logo from '../../assets/logo.svg'
import {Link} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'

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

    setSeletedUf(citie)
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

      <form>
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
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="text"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>


        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no Mapa</span>
          </legend>

          <Map center={[-16.3642849, -49.4927872]} zoom={15}>
            <TileLayer 
                attribution='&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[-16.3642849, -49.4927872]} />
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

           <li key={item.id}>
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