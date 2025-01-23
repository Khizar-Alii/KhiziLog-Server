import mongoose from "mongoose"
const ConnectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to DB Successfully");
    } catch (error) {
        console.log("Something went wrong while connecting to DB",error);
        process.exit(1)
    }
}
export default ConnectDB;