# Serverless APIs with IBM Cloud Functions (powered by Apache OpenWhisk)

This repository was forked from [ibm-cloud-functions-serverless-apis](https://github.com/IBM/ibm-cloud-functions-serverless-apis). I have made a few changes
1. Replaced mySQL with Cloudant as the persistance store.
2. Added an action that uses SendGrid to send an email when a cat with `crimson` color is added to the database.

This project shows how serverless, event-driven architectures can execute code that scales automatically in response to demand from HTTP REST API calls. No resources are consumed until the API endpoints are called. When they are called, resources are provisioned to exactly match the current load needed by each HTTP method independently. Additionally, the project also shows how to use `feeds` and `triggers` to fire `actions` using `rules`.

It shows four IBM Cloud Functions (powered by Apache OpenWhisk) actions (written in JavaScript) that write and read data in a Clouant noSQL database. This demonstrates how actions can work with supporting data services and execute logic in response to HTTP requests.

One action is mapped to HTTP POST requests. It inserts the supplied cat name and color parameters into the database. A second action is mapped to PUT requests to update those fields for an existing cat. A third action is mapped to GET requests that return specific cat data. A fourth action deletes a given cat data.

The Node.js runtime on the IBM Cloud provides a built-in whitelist of npm modules. This demo also highlights how additional Node.js dependencies – such as the SendGrid client – can be packaged in a ZIP file with custom actions to provide a high level of extensibility.

![Sample Architecture](docs/arch_buildserverless.png)

## Included components

- IBM Cloud Functions (powered by Apache OpenWhisk)
- IBM Cloudant

## Prerequisite

You should have a basic understanding of the OpenWhisk programming model. If not, [try the action, trigger, and rule demo first](https://github.com/IBM/openwhisk-action-trigger-rule).

Also, you'll need an IBM Cloud account and the latest [OpenWhisk command line tool (`ibmcloud fn`) installed and on your PATH](https://cloud.ibm.com/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).

As an alternative to this end-to-end example, you might also consider the more [basic "building block" version](https://github.com/IBM/openwhisk-rest-api-trigger) of this sample.

## Steps

1. [Provision Cloudant](#1-provision-cloudant)
2. [Create OpenWhisk actions and mappings](#2-create-openwhisk-actions-and-mappings)
3. [Test API endpoints](#3-test-api-endpoints)
4. [Delete actions and mappings](#4-delete-actions-and-mappings)
5. [Recreate deployment manually](#5-recreate-deployment-manually)

## 1. Provision Cloudant

Log into the IBM Cloud and provision a [Cloudant](https://console.ng.bluemix.net/catalog/services/cleardb-mysql-database/) database instance. Cloudant has a free tier for simple testing.

![](docs/cloudant-catalog-search.jpg)

Provision the lite tier of the Cloudant Service

![](docs/cloudant-create-instance.jpg)


Copy `local.env.json` to a new file named `env.json` and update the `CLOUDANT_API_KEY`, and `CLOUDANT_URL` for your Cloudant instance. You can get these credentials from the `Cloudant` dashboard as shown here:

![](docs/cloudant-credentials.jpg)

## 2. Create OpenWhisk actions and mappings

### Create a package to host our actions

```
wsk package create cat-package -P env.json
```
The -P binds the properties in the `env.json` file at the package level and all the actions inside the package can reference these parameters.
### Create cat-get action

```
wsk action create cat-package/cat-get actions/cat-get-action/index.js --kind nodejs:10
```

The `cat-get` action will be created inside the `cat-package`. We explicitly specify nodejs10 runtime as that has the `@cloudant/cloudant` npm package pre-installed. We can now try this action out by using the `invoke` command.

```
wsk action invoke cat-package/cat-get -r
```

Since we did not pass in any parameters, it just returns the first cat it finds in the database. We can also pass in an id as follows

```
wsk action invoke cat-package/cat-get -p id "35790b1e95675fc7569b7d2d1c5a4e1a" -r
```

### Create cat-delete action
```
wsk action create cat-package/cat-delete actions/cat-delete-action/index.js --kind nodejs:10
```
The action first finds the cat with the provided `id` and then `destroys` the cat.
### Create cat-post action

```
wsk action create cat-package/cat-post actions/cat-post-action/index.js --kind nodejs:10
```
### Create cat-put action

```
wsk action create cat-package/cat-put actions/cat-put-action/index.js --kind nodejs:10
```
### Create API endpoints

```
wsk action update cat-package/cat-get --web true
wsk api create /cats-v1 /cat GET cat-package/cat-get -n 'cat api'
```

```
wsk action update cat-package/cat-delete --web true
wsk api create /cats-v1 /cat DELETE cat-package/cat-delete -n 'cat api'
```

```
wsk action update cat-package/cat-post --web true
wsk api create /cats-v1 /cat POST cat-package/cat-post -n 'cat api'
```


```
wsk action update cat-package/cat-put --web true
wsk api create /cats-v1 /cat PUT cat-package/cat-put -n 'cat api'
```


### bind /whisk.system/cloudant action to personal namespace

```
wsk package bind /whisk.system/cloudant sfhtml5-cloudant-package
```

### bind the cloudant instance to the newly created package so that the credentails are automatically made available

```
ibmcloud fn service bind cloudantnosqldb sfhtml5-cloudant-package --instance Cloudant-s6
```

Show them how to get the servicename from the UI and the command line.
### Create SendGrid account and grab TOKEN from the dashboard

![](docs/sendgrid.jpg)

### Create send-email action
First install all the npm modules required by the send_email action
```
  npm install
```

Create the zip file so that the node_modules are packaged up inside our installable.
```
zip -r sendmail.zip .
```
We can now deploy the zip file to the IBM Cloud Functions.
```
wsk action create cat-package/send_email --kind nodejs:default sendmail.zip -P env.json
```
### create trigger `crimson_cat_trigger` that listens to the **/whisk.system/cloudant/changes** feed

```
wsk trigger create crimson_cat_trigger --feed sfhtml5-cloudant-package/changes --param dbname cats --param filter "color/crimson-color"
```

### create rule that links the `crimson_cat_trigger` trigger with the `send_email` action
```
wsk rule create crimson-cat-rule crimson_cat_trigger cat-package/send_email
```

## 3. Test API endpoints with postman

## 4. Delete actions and mappings

Use `deploy.sh` again to tear down the OpenWhisk actions and mappings. You will recreate them step-by-step in the next section.

```bash
./deploy.sh --uninstall
```
## License

[Apache 2.0](LICENSE.txt)
