import { MongoClient, ServerApiVersion, Collection, Document } from "mongodb"

// Validate .env variables
const { MONGODB_UNAME, MONGODB_PASS, DB_NAME } = process.env

if (!MONGODB_UNAME || !MONGODB_PASS || !DB_NAME) {
  throw new Error("Missing required MongoDB environment variables")
}

// Build URI
const uri = `mongodb+srv://${MONGODB_UNAME}:${MONGODB_PASS}@cluster0.lue0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Singleton client instance for hot-reloading in dev
let cachedClient: MongoClient | null = null

function getMongoClient(): MongoClient {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })
  }
  return cachedClient
}

// Strict collection names
export const collectionNameObj = {
  userCollection: "users",
  shopCollection: "shops",
  productCollection: "products",
} as const

// Generic database connector
export function dbConnect<T extends Document = Document>(
  collectionName: keyof typeof collectionNameObj | string
): Collection<T> {
  const client = getMongoClient()
  return client.db(DB_NAME).collection<T>(collectionName)
}
