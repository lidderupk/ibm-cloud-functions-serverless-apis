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
 * Get a cat by id
 * @param {Object} params - Input to the action
 * @param {string} params.CLOUDANT_URL - Full cloudant URL from the dashboard
 * @param {string} params.CLOUDANT_API_KEY - Cloudant API key from the dashboard
 * @param {string} params.id - cat id to retreive
 */
function main(params) {
  return new Promise(function(resolve, reject) {
    console.log(params);
    const Cloudant = require('@cloudant/cloudant');

    const cloudant = Cloudant({
      url: params.CLOUDANT_URL,
      plugins: {iamauth: {iamApiKey: params.CLOUDANT_API_KEY}}
    });

    const catsDb = cloudant.use('cats');
    catsDb.find({selector: {_id: params.id}}, function(err, result) {
      if (err) {
        console.log(err);
        throw err;
      }

      if (result.docs[0]) {
        resolve({
          statusCode: 200,
          headers: {'Content-Type': 'application/json'},
          body: result.docs[0]
        });
      } else {
        reject({
          headers: {'Content-Type': 'application/json'},
          statusCode: 404,
          body: {error: 'Not found.'}
        });
      }
    });
  });
}

exports.main = main;