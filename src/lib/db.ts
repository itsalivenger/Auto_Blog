import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase() {
  if (client && db) {
    return { client, db }
  }

  const uri = process.env.MONGODB_URI!
  client = new MongoClient(uri)
  
  try {
    await client.connect()
    db = client.db('auto_blog')
    console.log('Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function getDb() {
  console.log('getDb called')
  if (!db) {
    console.log('Database connection not established, calling connectToDatabase')
    await connectToDatabase()
  }
  return db!
}

export async function closeConnection() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
} 