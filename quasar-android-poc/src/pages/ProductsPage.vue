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
    <p v-if="scannedContent">Content from the barcode: {{ scannedContent }}</p>
    <!-- <qrcode-vue v-if="isQRCodeVisible" :value="qrCodeValue"></qrcode-vue> -->

    <q-btn @click="getLoadedProducts" color="primary" label="Load products" />
    <q-btn @click="addProduct" color="primary" label="Add Product" />
    <q-btn @click="logNetworkStatus" color="primary" label="Log network status" />
    <p>Network status: {{ status }}</p>
    <!-- <q-btn @click="testVisible = !testVisible" color="primary" label="Toggle" /> -->

    <!-- <q-btn @click="startScan" color="primary" label="Scan barcode" /> -->
    <q-btn
      @click="isCoordanatesVisible = !isCoordanatesVisible"
      color="primary"
      label="Load coordinates"
    />

    <q-table title="Products" :rows="products" :columns="columns" row-key="name" />
  </div>
</template>

<script>
import { getProducts } from 'src/services/productsService'
import { Geolocation } from '@capacitor/geolocation'
import { Network } from '@capacitor/network'
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
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
    return { network }
  },
  data() {
    return {
      products: [],
      columns,
      isGridVisible: true,
      showBackOnline: false,
      isQRCodeVisible: false,
      geolocation: {},
      isOnline: this.network.isOnline.value,
      testVisible: false,
      status: false,
      position: {},
      posTest: 'test',
      geoId: '',
      scannedContent: '',
      isCoordanatesVisible: false,
      qrCodeValue: 'Hi from QR code!',
    }
  },
  methods: {
    async getLoadedProducts() {
      this.products = await getProducts()
      console.log(this.products)
    },
    async logNetworkStatus() {
      this.status = await Network.getStatus()

      console.log('Network status:', this.status)
    },
    async getCurrentPosition() {
      try {
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
    // async startScan() {
    //   await BarcodeScanner.checkPermission({ force: true })

    //   BarcodeScanner.hideBackGround()
    //   this.isGridVisible = false
    //   const result = await BarcodeScanner.startScan() // start scanning and wait for a result

    //   // if the result has content
    //   if (result.hasContent) {
    //     this.scannedContent = result.content // log the raw scanned content
    //     this.isGridVisible = true
    //   }
    // },
  },
  watch: {
    isOnline(v) {
      console.log('in the watcher', v)
    },
  },
  async created() {
    await Network.addListener('networkStatusChange', (status) => {
      this.status = status
      console.log('Network status changed', status)
    })
    //console.log(this.isOnline)
    await this.getCurrentPosition()
    this.geoId = await Geolocation.watchPosition({}, (newPosition) => {
      console.log('New GPS position')
      this.position = newPosition
    })
  },
  beforeUnmount() {
    Geolocation.clearWatch(this.geoId)

    // window.removeEventListener('online', this.updateOnlineStatus)
    // window.removeEventListener('offline', this.updateOnlineStatus)
  },
}
</script>
