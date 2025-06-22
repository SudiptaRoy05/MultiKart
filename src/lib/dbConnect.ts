import { MongoClient, ServerApiVersion, Collection, Document } from "mongodb"

const uri = `mongodb+srv://${process.env.MONGODB_UNAME}:${process.env.MONGODB_PASS}@cluster0.lue0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export function dbConnect<T extends Document = Document>(collectionName: string): Collection<T> {
  if (!process.env.DB_NAME) {
    throw new Error("Missing DB_NAME in environment variables")
  }

  return client.db(process.env.DB_NAME).collection<T>(collectionName)
}
