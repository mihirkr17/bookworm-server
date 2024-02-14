
const fs = require("fs");
const CsvReadableStream = require("csv-reader");


async function readCsvFile(filePath) {
   return new Promise(async (resolve, reject) => {
      try {

         const results = [];

         // Create a readable stream from the JSON file
         fs.createReadStream(filePath, { encoding: 'utf8' })
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
               console.log(`Data successfully pushed to result.`);
               // console.log(results);
               resolve(results);
            });


         // return stream;
      } catch (error) {
         reject(error); // Reject the Promise on error
      }
   });
}

module.exports = { readCsvFile }