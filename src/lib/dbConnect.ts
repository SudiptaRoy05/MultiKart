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

async function getMongoClient(): Promise<MongoClient> {
  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      })
      // Test the connection
      await cachedClient.connect()
      await cachedClient.db("admin").command({ ping: 1 })
      console.log("Successfully connected to MongoDB.")
    } catch (error) {
      console.error("MongoDB connection error:", error)
      cachedClient = null
      throw new Error("Failed to connect to MongoDB")
    }
  }
  return cachedClient
}

// Strict collection names
export const collectionNameObj = {
  userCollection: "users",
  productCollection: "products",
  shopCollection: "shops",
  cartCollection: "carts",
  wishlistCollection: "wishlists",
} as const

// Generic database connector
export async function dbConnect<T extends Document = Document>(
  collectionName: keyof typeof collectionNameObj | string
): Promise<Collection<T>> {
  const client = await getMongoClient()
  return client.db(DB_NAME).collection<T>(collectionName)
}
