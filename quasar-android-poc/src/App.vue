<template>
  <router-view />
</template>

<script>
import { useProductStore } from './stores/productsStore'
// import { useDatabaseStore } from './stores/databaseStore'

export default {
  setup() {
    const productStore = useProductStore()
    // const databaseStore = useDatabaseStore()
    return {
      productStore,
    }
  },
  async created() {
    // await this.databaseStore.initializePlugin()
  },
}
</script>
