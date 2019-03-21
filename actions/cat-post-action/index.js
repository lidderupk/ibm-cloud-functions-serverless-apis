
/**
 * This action removes a Cat by ID from a MySQL database
 *
 * @param {Object} params - Input to the action
 * @param {string} params.CLOUDANT_URL - Full cloudant URL from the dashboard
 * @param {string} params.CLOUDANT_API_KEY - Cloudant API key from the dashboard
 * @param {string} params.name - cat id to retreive
 * @param {string} params.color - cat id to retreive
 *
 * @return  Promise for the MySQL result
 */
function main(params) {
  return new Promise(function(resolve, reject) {
    console.log('Connecting to Cloudant');
    // first get the id to get the revision, then delete.
    // throw error if the id is not there or if there is problem in deleting the
    // document

    const Cloudant = require('@cloudant/cloudant');

    const cloudant = Cloudant({
      url: params.CLOUDANT_URL,
      plugins: {iamauth: {iamApiKey: params.CLOUDANT_API_KEY}}
    });

    const catsDb = cloudant.use('cats');
    
    if(!params.name || !params.color) {
        reject({
            headers: {'Content-Type': 'application/json'},
            statusCode: 400,
            body: {error: 'Bad Request Error. Check that name and color are not missing.'}
          });
    }

    // create a new post
    catsDb.insert({name: params.name, color: params.color})
        .then(result => {
          console.log(result);
          // resolve with success
          resolve({
            statusCode: 201,
            headers: {'Content-Type': 'application/json'},
            body: {id: result.id}
          });
        })
        .catch(err => {
          console.log(err);
          // reject with error
          reject({
            headers: {'Content-Type': 'application/json'},
            statusCode: 500,
            body: {error: 'Error.'}
          });
        });
  });
}

exports.main = main;