import { defineStore } from 'pinia'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { api } from 'src/axios'
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite'
const myDB = 'myrequestsDB'

export const useDatabaseStore = defineStore('databaseStore', {
  state: () => ({
    database: {},
    offlineRequests: [],
    localDataProducts: [],
  }),
  actions: {
    async initializePlugin() {
      try {
        console.log(Capacitor.getPlatform())
        const sqlite = new SQLiteConnection(CapacitorSQLite)
        if (Capacitor.getPlatform() === 'web') {
          customElements.define('jeep-sqlite', JeepSqlite)
          const jeepSqliteEl = document.createElement('jeep-sqlite')
          document.body.appendChild(jeepSqliteEl)
          await customElements.whenDefined('jeep-sqlite')
          console.log(jeepSqliteEl)
          await sqlite.initWebStore()
        }
        console.log('Opening db connection1')
        console.log(sqlite)

        console.log('Opening db connection2')
        const ret = await sqlite.checkConnectionsConsistency()
        const isConn = await sqlite.isConnection(myDB, false)
        console.log('ret')
        console.log(ret)
        console.log('isConn')
        console.log(isConn)

        if (ret.result && isConn) {
          this.database = await sqlite.retrieveConnection(myDB, false)
        } else {
          console.log('in the second if')
          this.database = await sqlite.createConnection(myDB, false, 'no-encryption', 1, false)
        }

        await this.database.open()

        const schema = `CREATE TABLE IF NOT EXISTS OfflineRequests(id INTEGER PRIMARY KEY AUTOINCREMENT,requestApiMethod TEXT NOT NULL,[data] TEXT NOT NULL,[url] TEXT NOT NULL,createdAt DATETIME NOT NULL)
        ;CREATE TABLE IF NOT EXISTS LocalDataProducts(id INTEGER PRIMARY KEY, title text not null, price real not null, description text not null, category text not null, image text not null, ratingRate real not null, ratingCount integer not null)`

        await this.database.execute(schema)
        console.log(this.database)
        console.log('Database initialized successfully')
      } catch (ex) {
        console.log(ex)
      }
    },
    async loadOfflineRequests() {
      const offlineRequests = await this.database.query(
        'SELECT * FROM OfflineRequests ORDER BY createdAt DESC',
      )
      this.offlineRequests = offlineRequests.values
    },
    async storeOfflineRequest(url, type, data) {
      const createdAt = this.getFormattedDate()
      console.log(`'${data}'`)
      await this.database
        .query(`INSERT INTO OfflineRequests (requestApiMethod, [data], [url], createdAt)
            VALUES ('${type}', '${data}', '${url}', '${createdAt}')`)
    },
    async insertLocalData(products) {
      console.log('products')
      console.log(products)

      for (let product of products) {
        const escapedCategory = product.category.replace(/'/g, '`')
        await this.database.query(
          `INSERT INTO LocalDataProducts (id, title, price, description, category, image, ratingRate, ratingCount)
                      VALUES (${product.id}, '${product.title}', ${product.price}, '${product.description}', '${escapedCategory}', '${product.image}', ${product.rating.rate}, ${product.rating.count})`,
        )
      }
    },
    async getLocalData() {
      const localData = await this.database.query(`SELECT * FROM LocalDataProducts`)
      const mappedLocalData = localData.values
      this.localDataProducts = mappedLocalData
      return mappedLocalData
    },
    getFormattedDate() {
      const now = new Date()

      const year = now.getFullYear()
      const day = String(now.getDate()).padStart(2, '0') // Add leading zero if needed
      const month = String(now.getMonth() + 1).padStart(2, '0') // Months are zero-based
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      return `${year}-${day}-${month} ${hours}:${minutes}:${seconds}`
    },
    async sendRequests() {
      await this.loadOfflineRequests()

      for (let request of this.offlineRequests) {
        console.log('Sending operation')
        api
          .request({
            url: request.url,
            method: request.type,
            data: request.data,
          })
          .then((response) => {
            console.log('Successfully sent request')
            console.log(response)
          })
          .catch((er) => {
            console.log(er)
            this.storeOfflineRequest(request.url, request.type, request.data)
          })
      }

      this.offlineRequests = []
      await this.database.query('TRUNCATE TABLE OfflineRequests')
    },
  },
})
