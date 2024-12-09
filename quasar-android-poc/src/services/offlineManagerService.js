import { Preferences } from '@capacitor/preferences'
import { api } from 'src/axios'

const storedKey = 'specialkey'
export const storeRequest = async (url, type, data) => {
  console.log('Your data is stored locally because you seem to be offline')
  const time = new Date().getTime()
  let action = {
    url,
    type,
    data,
    time,
  }

  const { value } = await Preferences.get({
    key: storedKey,
  })
  let storedObj = JSON.parse(value)

  if (storedObj) {
    storedObj.push(action)
  } else {
    storedObj = [action]
  }
  console.log('Local request stored')
  await Preferences.set({
    key: storedKey,
    value: JSON.stringify(storedObj),
  })
}

export const sendRequests = async () => {
  // api.request()
  // await Preferences.remove({ key: storedKey })
  const { value } = await Preferences.get({
    key: storedKey,
  })
  console.log('Send requests value')
  const operationsArray = JSON.parse(value)
  console.log(operationsArray)
  for (let opr of operationsArray) {
    console.log('Sending operation')
    console.log(opr.url + ' ->  ' + opr.type)
    const response = await api.request({ url: opr.url, method: opr.type, data: opr.data })
    console.log('Successfully executed the query')
    console.log(response)
  }
  await Preferences.remove({ key: storedKey })
}
