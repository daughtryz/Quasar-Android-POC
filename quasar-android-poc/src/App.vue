<template>
  <router-view />
</template>

<script>
import { useProductStore } from './stores/productsStore';

export default {
  setup() {
    const productStore = useProductStore();

    return {
      productStore
    }
  },
  async created() {
    //await this.productStore.getProductsFromStore();
  }
}
</script>
