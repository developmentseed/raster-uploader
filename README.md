<h1 align=center>Raster Uploader</h1>

<p align=center>Imagery in, COGS out!</p>

## Installation

### API

```sh
cd api/

nvm use 18 # (something greater than 12?)
npm install

# may need
# echo "CREATE ROLE postgres WITH SUPERUSER, LOGIN" | psql postgres
# if you don't have that role already
echo "CREATE DATABASE uploader" | psql -U postgres

npx knex migrate:latest

yarn dev
```

### UI

```sh
cd api/web

npm install

yarn dev
```

App should be running locally at localhost:4999

... However you will need some user in the database in order to use the app. One way to deal with this is to replicate the production database. You can do this by running the ./clone prod command.

First you must:

1. Install the [Deploy](https://github.com/openaddresses/deploy) utility.
2. Update the profile in .deploy to match the AWS profile name you use locally that is associated with the AWS account of the production database (i.e. the profile name in ~/.aws/credentials).

```bash
# Not sure all these permissions are necessary
echo "CREATE ROLE uploader WITH SUPERUSER LOGIN" | psql -U postgres
echo "CREATE ROLE rdsadmin WITH SUPERUSER LOGIN" | psql -U postgres
./clone prod
```

## Deployment

Deployment to AWS is handled via AWS Cloudformation. The template can be found in the `./cloudformation`
directory.

There are two methods to deploy the stack, either via [Deploy](https://github.com/openaddresses/deploy). Alternatively,
or via a generic Cloudformation JSON.

The Cloudformation JSON can be generated via:

```sh
npx deploy json
```
and then deployed via the AWS CLI or AWS Console UI.

It is highly recommended however to use the deploy tool over this method as Parameters, existance of
ECS/Docker resources, & S3 access are not provided by the default AWS Cloudformation deploy experience
and must be checked manually before a deployment can succeed.

Deploy comes pre-installed in the reposity and can be run via:
```sh
npx deploy
```

To install it globally - view the deploy [README](https://github.com/openaddresses/deploy)

Deploy uses your existing devseed AWS credentials. Ensure that your `~/.aws/credentials`
file looks like:
```
[impact]
aws_access_key_id = <redacted>
aws_secret_access_key = <redacted>
```

Then run

```sh
npx deploy init
```

To configure the tool.

Initial deployment can then done via:

```
npx deploy create <stackname>
```

and subsequent deployments can be down via:

```
npx deploy update <stackname>
```

