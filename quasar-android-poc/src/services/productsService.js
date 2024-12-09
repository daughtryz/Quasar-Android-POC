import { api } from 'src/axios'

export const getProducts = async () => {
  let products = []
  try {
    const response = await api.get('products')
    products = response.data.slice(0, 4)
  } catch (ex) {
    console.log('error', ex)
    if (ex.code === 'ERR_NETWORK') {
      console.log('ERR_NETWORK')
    }
  }

  return products
}

export const addProduct = async (product) => {
  try {
    const response = await api.post('products', product)
    console.log(response)
  } catch (ex) {
    console.log('error', ex)
    if (ex.code === 'ERR_NETWORK') {
      console.log('ERR_NETWORK')
    }
  }
}

export const editProduct = async (id, product) => {
  try {
    const response = await api.put(`products/${id}`, product)
    console.log(response)
  } catch (ex) {
    console.log('error', ex)
    if (ex.code === 'ERR_NETWORK') {
      console.log('ERR_NETWORK')
    }
  }
}
// export default { getProducts, addProducts }
