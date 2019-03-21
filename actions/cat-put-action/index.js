/**
 * Copyright 2017-2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * This action removes a Cat by ID from a MySQL database
 *
 * @param {Object} params - Input to the action
 * @param {string} params.CLOUDANT_URL - Full cloudant URL from the dashboard
 * @param {string} params.CLOUDANT_API_KEY - Cloudant API key from the dashboard
 * @param {string} params.id - cat id to retreive
 * @param {string} params.name - cat name to update
 * @param {string} params.color - cat color to update
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
    catsDb.find({selector: {_id: params.id}})
        .then(result => {
          if (result.docs[0]) {
            return result.docs[0];
          } else {
            throw new Error(`No cats found with id ${params.id}`)
          }
        })
        .then(cat => {
          console.log('cat found ... then update cat !');
          console.log(`old cat: ${JSON.stringify(cat)}`);
          return catsDb.insert({
            _id: cat._id,
            _rev: cat._rev,
            name: params.name,
            color: params.color
          })
        })
        .then(result => {
          console.log(result);
          resolve({
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: {success: 'Cat updated.'}
          });
        })
        .catch(err => {
          console.log('final catch');
          reject({
            headers: {'Content-Type': 'application/json'},
            statusCode: 500,
            body: {error: 'Cat could not be updated.'}
          });
        });
  });
}

exports.main = main;
