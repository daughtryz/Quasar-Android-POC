import { defineStore } from 'pinia'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { api } from 'src/axios'

const myDB = 'myrequestsDB'
export const useDatabaseStore = defineStore('databaseStore', {
  state: () => ({
    database: {},
    offlineRequests: [],
  }),
  actions: {
    async initializePlugin() {
      const sqlite = new SQLiteConnection(CapacitorSQLite)
      this.database = await sqlite.createConnection(myDB, false, 'no-encryption', 1, false)

      await this.database.open()

      const schema = `CREATE TABLE IF NOT EXISTS OfflineRequests(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(20) NOT NULL
        data VARCHAR(MAX) NOT NULL
        url VARCHAR(MAX) NOT NULL
        createdAt DATETIME NOT NULL)`

      await this.database.execute(schema)

      console.log('Database initialized successfully')
    },
  },
  async loadOfflineRequests() {
    const offlineRequests = await this.database.query('SELECT * FROM OfflineRequests')
    this.offlineRequests = offlineRequests.values
    console.log(this.offlineRequests)
  },
  async storeOfflineRequest(url, type, data) {
    await this.database.query(`INSERT INTO OfflineRequests (type, data, url)
        VALUES (${url}, ${type}, ${data})`)
  },
  async truncateOfflineRequests() {
    await this.database.query('TRUNCATE TABLE OfflineRequests')
  },
  async sendRequests() {
    const offlineRequests = await this.database.query('SELECT * FROM OfflineRequests')
    let requests = offlineRequests.values

    for (let request of requests) {
      console.log('Sending operation')
      const response = await api.request({
        url: request.url,
        method: request.type,
        data: request.data,
      })
      console.log(response)
    }
    await this.database.query('TRUNCATE TABLE OfflineRequests')
  },
})
