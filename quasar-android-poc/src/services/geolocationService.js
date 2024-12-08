import { axios } from 'src/axios'

const axiosClient = axios.create({ baseURL: 'http://ip-api.com/' })
const getGeolocation = async () => {
  let geolocation = {}
  try {
    const response = await axiosClient.get('json/')
    geolocation = response.data
  } catch {
    console.log('error')
  }

  return geolocation
}

export default getGeolocation
