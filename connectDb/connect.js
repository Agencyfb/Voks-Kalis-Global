import mongoose from "mongoose";

let connectionPromise;

export default async function connectDb() {
    if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL is not configured.");
    }

    if (mongoose.connection.readyState === 1) return mongoose;

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL).catch((error) => {
            connectionPromise = undefined;
            throw error;
        });
    }

    return connectionPromise;
}