import { defineStore } from 'pinia'

export const useProductStore = defineStore('productsStore', {
  state: () => ({
    products: [],
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    addProductsFromStore(product) {
        console.log('added product');
      this.products.push(product);
      console.log(this.products);
    },
  },
})
