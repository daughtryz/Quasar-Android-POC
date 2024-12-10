<template>
  <div v-if="isGridVisible" class="q-pa-md q-gutter-sm">
    <h1>Products</h1>
    <p v-if="testVisible">New</p>
    <template v-if="isCoordanatesVisible">
      <p>Longitude: {{ position.coords.longitude }}</p>
      <p>Latitude: {{ position.coords.latitude }}</p>
    </template>
    <p>{{ position }}</p>
    <!-- <p>{{ network.isOnline }}</p> -->
    <!-- <p v-if="scannedContent">Content from the barcode: {{ scannedContent }}</p> -->
    <!-- <qrcode-vue v-if="isQRCodeVisible" :value="qrCodeValue"></qrcode-vue> -->

    <q-btn @click="getLoadedProducts" color="primary" label="Load products" />
    <q-btn @click="logNetworkStatus" color="primary" label="Log network status" />
    <p>Network status: {{ status }}</p>
    <!-- <q-btn @click="testVisible = !testVisible" color="primary" label="Toggle" /> -->
    <template v-if="isCapacitor">
      <q-btn @click="startScan" color="primary" label="Scan barcode" />
      <p v-if="scannedContent">Content from the barcode: {{ scannedContent }}</p>
    </template>
    <q-btn
      @click="isCoordanatesVisible = !isCoordanatesVisible"
      color="primary"
      label="Load coordinates"
    />
    <q-table
      loading-label="Products are loading"
      :loading="isLoading"
      title="Products"
      :rows="products"
      :columns="columns"
      row-key="name"
    />
    <p v-if="status">You are online.</p>
    <p v-else>You are offline.</p>
    <q-input v-model="newTitle" type="text" label="Enter new title for id 1" />
    <q-btn @click="editProductFromPage" color="primary" label="Edit product with id 1" />
  </div>
</template>

<script>
import { getProducts, editProduct } from 'src/services/productsService'
import { Geolocation } from '@capacitor/geolocation'
import { Network } from '@capacitor/network'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import { Preferences } from '@capacitor/preferences'
// import { storeRequest, sendRequests } from 'src/services/offlineManagerService'
import { useDatabaseStore } from 'src/stores/databaseStore'
// import { useProductStore } from 'src/stores/productsStore'
// import { useNetwork } from '@vueuse/core'
// import { reactive } from 'vue'
import { useNetwork } from '@vueuse/core'
const columns = [
  {
    name: 'category',
    required: true,
    label: 'Category',
    position: 'determining',
    align: 'left',
    field: 'category',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    align: 'center',
    label: 'description',
    field: 'description',
    sortable: true,
  },
  { name: 'image', label: 'Image', field: 'image' },
  { name: 'price', label: 'Price', field: 'price' },
  { name: 'title', label: 'Title', field: 'title' },
]

export default {
  setup() {
    const network = useNetwork()
    const databaseStore = useDatabaseStore()
    return { network, databaseStore }
  },
  data() {
    return {
      products: [],
      columns,
      isGridVisible: true,
      isLoading: false,
      showBackOnline: false,
      isQRCodeVisible: false,
      geolocation: {},
      isCapacitor: process.env.MODE === 'capacitor',
      isOnline: this.network.isOnline.value,
      testVisible: false,
      status: false,
      position: {},
      newTitle: '',
      posTest: 'test',
      geoId: '',
      scannedContent: '',
      isCoordanatesVisible: false,
      qrCodeValue: 'Hi from QR code!',
    }
  },
  methods: {
    async getLoadedProducts() {
      this.isLoading = true
      console.log(this.status)
      if (!this.status.connected) {
        setTimeout(async () => {
          console.log('Getting data from local store')
          const products = await this.databaseStore.getLocalData()
          console.log(products)
          this.isLoading = false
          this.products = products
        }, '3000')
      } else {
        setTimeout(async () => {
          console.log('Getting data from the API')
          this.products = await getProducts()
          this.isLoading = false
          await this.databaseStore.insertLocalData(this.products)
        }, '3000')
      }
    },
    async editProductFromPage() {
      const currentProduct = this.products.find((x) => x.id === 1)
      console.log(currentProduct)
      currentProduct.title = this.newTitle

      if (!this.status.connected && this.status.connectionType === 'none') {
        let url = `products/${currentProduct.id}`
        let data = JSON.stringify(currentProduct)
        let type = 'put'
        await this.databaseStore.storeOfflineRequest(url, type, data)
      } else {
        await editProduct(currentProduct.id, currentProduct)
      }
    },
    async logNetworkStatus() {
      this.status = await Network.getStatus()

      console.log('Network status:', this.status)
    },
    async setLocalData(dataToStore, key) {
      await Preferences.set({
        key,
        value: JSON.stringify(dataToStore),
      })
    },
    async getLocalData(key) {
      const { value } = await Preferences.get({ key })
      console.log(value)
      return value
    },
    async getCurrentPosition() {
      try {
        if (process.env.MODE === 'capacitor') {
          const permissionStatus = await Geolocation.requestPermissions()

          if (permissionStatus?.location != 'granted') {
            const requestStatus = await Geolocation.requestPermissions()
            if (requestStatus.location != 'granted') {
              return null
            }
          }
          let options = {
            maximumAge: 3000,
            timeout: 10000,
            enableHighAccuracy: true,
          }
          this.position = await Geolocation.getCurrentPosition(options)
        } else {
          this.position = await Geolocation.getCurrentPosition()
        }
        console.log(this.position)
      } catch (ex) {
        console.log('Error happened', ex)
      }
    },
    addProduct() {
      const product = {
        name: 'New product',
        price: 20,
      }
      this.productStore.addProductsFromStore(product)
    },
    updateOnlineStatus(e) {
      const { type } = e
      this.onLine = type === 'online'
    },
    async startScan() {
      await BarcodeScanner.checkPermission({ force: true })

      BarcodeScanner.hideBackGround()
      this.isGridVisible = false
      const result = await BarcodeScanner.startScan() // start scanning and wait for a result

      // if the result has content
      if (result.hasContent) {
        this.scannedContent = result.content // log the raw scanned content
        this.isGridVisible = true
      }
    },
    updateNetworkStatus() {
      console.log('Updated')
      this.status = navigator.onLine
    },
  },
  async created() {
    this.status = await Network.getStatus()
    await Network.addListener('networkStatusChange', async (status) => {
      this.status = status
      if (this.status.connected) {
        await this.databaseStore.sendRequests()
      }
      console.log('Network status changed', status)
    })
    await this.getCurrentPosition()
    this.geoId = await Geolocation.watchPosition({}, (newPosition) => {
      console.log('New GPS position')
      this.position = newPosition
    })
  },
  beforeUnmount() {
    Geolocation.clearWatch(this.geoId)
  },
}
</script>
