// const myDB = 'myrequestsDB'
// import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
// let database = null
// export const initializePlugin = async () => {
//   const sqlite = new SQLiteConnection(CapacitorSQLite)
//   database = await sqlite.createConnection(myDB, false, 'no-encryption', 1, false)

//   await database.open()

//   const schema = `CREATE TABLE IF NOT EXISTS OfflineRequests(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   type VARCHAR(20) NOT NULL)
//   data VARCHAR(MAX)`

//   await database.execute(schema)
// }

// export const loadOfflineRequests = async () => {
//   const offlineRequests = await database.query('SELECT * FROM OfflineRequests')
//   console.log(offlineRequests.values)
//   return offlineRequests.values
// }
