const mongoose = require("mongoose");
const { MONGO_URI } = require("./constant");
// Database connection
async function dbConnection() {
   const MAX_RETRY = 10;
   let retries = 0;


   while (retries < MAX_RETRY) {
      try {
         await mongoose.connect(MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // serverApi: ServerApiVersion.v1,
         });

         console.log("Mongodb connected successfully...");

         break;
      } catch (error) {
         console.log(`Hitting url: ${MONGO_URI}`);
         console.log(`Connection attempt ${retries + 1} failed: ${error.message}`);
         retries++;
         await new Promise((resolve) => setTimeout(resolve, 2000));
      }
   }

   if (retries === MAX_RETRY) {
      console.log(
         "Max retries reached. Unable to establish a connection to MongoDB."
      );

      throw new Error(`Please enter valid mongo uri!`);
   }
}

module.exports = dbConnection;