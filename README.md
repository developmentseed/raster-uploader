<h1 align=center>Raster Uploader</h1>

<p align=center>Imagery in, COGS out!</p>

## Installation

```sh
npm install
```

## Deployment

Deployment to AWS is handled via AWS Cloudformation. The template can be found in the `./cloudformation`
directory.

There are two methods to deploy the stack, either via [Deploy](https://github.com/openaddresses/deploy). Alternatively,
or via a generic Cloudformation JSON.

The Cloudformation JSON can be generated via:

```sh
npx depoy json
```
and then deployed via the AWS CLI or AWS Console UI.

It is highly recommended however to use the deploy tool over this method as Parameters, existance of
ECS/Docker resources, & S3 access are not provided by the default AWS Cloudformation deploy experience
and must be checked manually before a deploy can suceed.

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

