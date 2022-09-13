
/**
* @api {get} /schema GET /schema
* @apiVersion 1.0.0
* @apiName GET-/schema
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListSchema.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListSchema.json} apiSuccess
*/


/**
* @api {get} /basemap List BaseMap
* @apiVersion 1.0.0
* @apiName GET-/basemap
* @apiGroup BaseMap
* @apiPermission user
*
* @apidescription
*   Return a list of basemaps
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListBaseMap.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListBaseMap.json} apiSuccess
*/


/**
* @api {get} /basemap/:basemap Get BaseMap
* @apiVersion 1.0.0
* @apiName GET-/basemap/:basemap
* @apiGroup BaseMap
* @apiPermission user
*
* @apidescription
*   Get a single basemap
*
* @apiParam {integer} basemap param
*
*
*
* @apiSchema {jsonschema=../schema/basemap.json} apiSuccess
*/


/**
* @api {post} /basemap Create BaseMap
* @apiVersion 1.0.0
* @apiName POST-/basemap
* @apiGroup BaseMap
* @apiPermission user
*
* @apidescription
*   Create a new basemap
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateBaseMap.json} apiParam
* @apiSchema {jsonschema=../schema/basemap.json} apiSuccess
*/


/**
* @api {patch} /basemap/:basemap Update BaseMap
* @apiVersion 1.0.0
* @apiName PATCH-/basemap/:basemap
* @apiGroup BaseMap
* @apiPermission user
*
* @apidescription
*   Update information about a given basemap
*
* @apiParam {integer} basemap param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchBaseMap.json} apiParam
* @apiSchema {jsonschema=../schema/basemap.json} apiSuccess
*/


/**
* @api {delete} /basemap/:basemap Delete BaseMap
* @apiVersion 1.0.0
* @apiName DELETE-/basemap/:basemap
* @apiGroup BaseMap
* @apiPermission user
*
* @apidescription
*   Delete a given basemap
*
* @apiParam {integer} basemap param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /collection List Collections
* @apiVersion 1.0.0
* @apiName GET-/collection
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Return a list of collections
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListCollections.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListCollections.json} apiSuccess
*/


/**
* @api {post} /collection/:collection/trigger Trigger Collection
* @apiVersion 1.0.0
* @apiName POST-/collection/:collection/trigger
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Manually trigger a collection outside of set Cron rules
*
* @apiParam {integer} collection param
*
*
*
* @apiSchema {jsonschema=../schema/collections.json} apiSuccess
*/


/**
* @api {get} /collection/:collection Get Collection
* @apiVersion 1.0.0
* @apiName GET-/collection/:collection
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Get a single collection
*
* @apiParam {integer} collection param
*
*
*
* @apiSchema {jsonschema=../schema/collections.json} apiSuccess
*/


/**
* @api {post} /collection Create Collection
* @apiVersion 1.0.0
* @apiName POST-/collection
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Create a new collection
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateCollection.json} apiParam
* @apiSchema {jsonschema=../schema/collections.json} apiSuccess
*/


/**
* @api {patch} /collection/:collection Update Collection
* @apiVersion 1.0.0
* @apiName PATCH-/collection/:collection
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Update information about a given collection
*
* @apiParam {integer} collection param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchCollection.json} apiParam
* @apiSchema {jsonschema=../schema/collections.json} apiSuccess
*/


/**
* @api {delete} /collection/:collection Delete Collection
* @apiVersion 1.0.0
* @apiName DELETE-/collection/:collection
* @apiGroup Collection
* @apiPermission user
*
* @apidescription
*   Delete a given collection
*
* @apiParam {integer} collection param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /login Session Info
* @apiVersion 1.0.0
* @apiName GET-/login
* @apiGroup Login
* @apiPermission user
*
* @apidescription
*   REturn information about the currently logged in user
*

*
*
*
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login Create Session
* @apiVersion 1.0.0
* @apiName POST-/login
* @apiGroup Login
* @apiPermission user
*
* @apidescription
*   Log a user into the service and create an auth cookie
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login/verify Verify User
* @apiVersion 1.0.0
* @apiName POST-/login/verify
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   Email verification of a new user
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.VerifyLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/forgot Forgot Login
* @apiVersion 1.0.0
* @apiName POST-/login/forgot
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   If a user has forgotten their password, send a password reset link to their email
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ForgotLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/reset Reset Login
* @apiVersion 1.0.0
* @apiName POST-/login/reset
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   Once a user has obtained a password reset by email via the Forgot Login API, use the token to reset the password
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ResetLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /machine Internal
* @apiVersion 1.0.0
* @apiName POST-/machine
* @apiGroup Machine
* @apiPermission machine
*
* @apidescription
*
Obtain tasks started as part of a collection via the EventBridge scheduling
rules must obtain data about the user/collection that initiated the task

*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateMachine.json} apiParam
* @apiSchema {jsonschema=../schema/res.Machine.json} apiSuccess
*/


/**
* @api {get} /map Map Init
* @apiVersion 1.0.0
* @apiName GET-/map
* @apiGroup Map
* @apiPermission user
*
* @apidescription
*   Data required for new map initialization
*

*
*
*
*
*/


/**
* @api {get} /meta List Meta
* @apiVersion 1.0.0
* @apiName GET-/meta
* @apiGroup Meta
* @apiPermission admin
*
* @apidescription
*   Return a list of metadata objects
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListMeta.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListMeta.json} apiSuccess
*/


/**
* @api {post} /meta Create Meta
* @apiVersion 1.0.0
* @apiName POST-/meta
* @apiGroup Meta
* @apiPermission Create a new metadata object
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateMeta.json} apiParam
* @apiSchema {jsonschema=../schema/meta.json} apiSuccess
*/


/**
* @api {patch} /meta/:key Update Meta
* @apiVersion 1.0.0
* @apiName PATCH-/meta/:key
* @apiGroup Meta
* @apiPermission admin
*
* @apidescription
*   Update a metadata object
*
* @apiParam {string} key param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchMeta.json} apiParam
* @apiSchema {jsonschema=../schema/meta.json} apiSuccess
*/


/**
* @api {delete} /meta/:key Delete Meta
* @apiVersion 1.0.0
* @apiName DELETE-/meta/:key
* @apiGroup Meta
* @apiPermission admin
*
* @apidescription
*   Delete a metadata object
*
* @apiParam {string} key param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /obtain Create Obtain
* @apiVersion 1.0.0
* @apiName POST-/obtain
* @apiGroup Obtain
* @apiPermission user
*
* @apidescription
*   Create a new obtain task
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateObtain.json} apiParam
* @apiSchema {jsonschema=../schema/uploads.json} apiSuccess
*/


/**
* @api {get} /token List Tokens
* @apiVersion 1.0.0
* @apiName GET-/token
* @apiGroup Token
* @apiPermission user
*
* @apidescription
*   List all tokens associated with the requesters account
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListTokens.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListTokens.json} apiSuccess
*/


/**
* @api {post} /token Create Token
* @apiVersion 1.0.0
* @apiName POST-/token
* @apiGroup Token
* @apiPermission user
*
* @apidescription
*   Create a new API token for programmatic access
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateToken.json} apiParam
* @apiSchema {jsonschema=../schema/res.CreateToken.json} apiSuccess
*/


/**
* @api {get} /token/:token_id Get Token
* @apiVersion 1.0.0
* @apiName GET-/token/:token_id
* @apiGroup Token
* @apiPermission user
*
* @apidescription
*   Get information about a single token
*
* @apiParam {integer} token_id param
*
*
*
* @apiSchema {jsonschema=../schema/res.Token.json} apiSuccess
*/


/**
* @api {delete} /token/:token_id Delete Token
* @apiVersion 1.0.0
* @apiName DELETE-/token/:token_id
* @apiGroup Token
* @apiPermission user
*
* @apidescription
*   Delete a user's API Token
*
* @apiParam {integer} token_id param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /upload/:upload/download Download
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload/download
* @apiGroup DownloadUpload
* @apiPermission user
*
* @apidescription
*   Download the initially uploaded file
*
* @apiParam {integer} upload param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.DownloadUpload.json} apiParam
*
*
*/


/**
* @api {get} /source List Sources
* @apiVersion 1.0.0
* @apiName GET-/source
* @apiGroup UploadSource
* @apiPermission user
*
* @apidescription
*   Return a list of sources
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListUploadSources.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListUploadSources.json} apiSuccess
*/


/**
* @api {get} /source/:source Get Source
* @apiVersion 1.0.0
* @apiName GET-/source/:source
* @apiGroup UploadSource
* @apiPermission user
*
* @apidescription
*   Get a single soruce
*
* @apiParam {integer} source param
*
*
*
* @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
*/


/**
* @api {post} /source Create Source
* @apiVersion 1.0.0
* @apiName POST-/source
* @apiGroup UploadSource
* @apiPermission user
*
* @apidescription
*   Create a new source
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateUploadSource.json} apiParam
* @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
*/


/**
* @api {patch} /source/:source Update Source
* @apiVersion 1.0.0
* @apiName PATCH-/source/:source
* @apiGroup UploadSource
* @apiPermission user
*
* @apidescription
*   Update information about a given source
*
* @apiParam {integer} source param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUploadSource.json} apiParam
* @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
*/


/**
* @api {delete} /source/:source Delete Source
* @apiVersion 1.0.0
* @apiName DELETE-/source/:source
* @apiGroup UploadSource
* @apiPermission user
*
* @apidescription
*   Delete a given source
*
* @apiParam {integer} source param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /upload/:upload/step/:step/cog/transform COG Transform
* @apiVersion 1.0.0
* @apiName POST-/upload/:upload/step/:step/cog/transform
* @apiGroup COGS
* @apiPermission user
*
* @apidescription
*   Perform a transform step on a COG
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateTransform.json} apiParam
* @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
*/


/**
* @api {get} /upload/:upload/step/:step/cog/download COG Download
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload/step/:step/cog/download
* @apiGroup COGS
* @apiPermission user
*
* @apidescription
*   Download a COG
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.COGDownload.json} apiParam
*
*
*/


/**
* @api {get} /upload/:upload/step/:step/cog/info COG Info
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload/step/:step/cog/info
* @apiGroup COGS
* @apiPermission user
*
* @apidescription
*   Get information about a COG
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
*
*
*/


/**
* @api {get} /cog/:z/:x/:y.png COG Tile
* @apiVersion 1.0.0
* @apiName GET-/cog/:z/:x/:y.png
* @apiGroup COGS
* @apiPermission user
*
* @apidescription
*   Get a given tile from a COG
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
* @apiParam {integer} z param
* @apiParam {integer} x param
* @apiParam {integer} y param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.COGTile.json} apiParam
*
*
*/


/**
* @api {get} /upload/:upload/step List Steps
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload/step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Return a list of steps related to a given upload
*
* @apiParam {integer} upload param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListUploadSteps.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListUploadSteps.json} apiSuccess
*/


/**
* @api {get} /upload/:upload/step/:step Get Step
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload/step/:step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Get a single upload step
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
*
* @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
*/


/**
* @api {post} /upload/:upload/step Create Step
* @apiVersion 1.0.0
* @apiName POST-/upload/:upload/step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Creata a new upload step
*
* @apiParam {integer} upload param
*
*
*
* @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
*/


/**
* @api {patch} /upload/:upload/step/:step Update Step
* @apiVersion 1.0.0
* @apiName PATCH-/upload/:upload/step/:step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Update information about a given upload
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUploadStep.json} apiParam
* @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
*/


/**
* @api {delete} /upload/:upload/step/:step Delete Step
* @apiVersion 1.0.0
* @apiName DELETE-/upload/:upload/step/:step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Delete a given upload step
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {put} /upload/:upload/step/:step Resubmit Step
* @apiVersion 1.0.0
* @apiName PUT-/upload/:upload/step/:step
* @apiGroup Steps
* @apiPermission user
*
* @apidescription
*   Resubmit a step to the SQS Queue
*
* @apiParam {integer} upload param
* @apiParam {integer} step param
*
*
*
* @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
*/


/**
* @api {get} /upload List Uploads
* @apiVersion 1.0.0
* @apiName GET-/upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*   Return a list of uploads that have been attempted by a user
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListUploads.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListUploads.json} apiSuccess
*/


/**
* @api {get} /upload/:upload Get Upload
* @apiVersion 1.0.0
* @apiName GET-/upload/:upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*   Get a single upload
*
* @apiParam {integer} upload param
*
*
*
* @apiSchema {jsonschema=../schema/uploads.json} apiSuccess
*/


/**
* @api {put} /upload JSON Upload
* @apiVersion 1.0.0
* @apiName PUT-/upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*
Create a new upload but don't populate it with an actual file
Generally this will only be called internally via the obtain task

*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateUpload.json} apiParam
* @apiSchema {jsonschema=../schema/uploads.json} apiSuccess
*/


/**
* @api {post} /upload Create Upload
* @apiVersion 1.0.0
* @apiName POST-/upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*   Create a new upload
*

*
*
*
* @apiSchema {jsonschema=../schema/uploads.json} apiSuccess
*/


/**
* @api {patch} /upload/:upload Update Upload
* @apiVersion 1.0.0
* @apiName PATCH-/upload/:upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*   Update information about a given upload
*
* @apiParam {integer} upload param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUpload.json} apiParam
* @apiSchema {jsonschema=../schema/uploads.json} apiSuccess
*/


/**
* @api {delete} /upload/:upload Delete Upload
* @apiVersion 1.0.0
* @apiName DELETE-/upload/:upload
* @apiGroup Upload
* @apiPermission user
*
* @apidescription
*   Delete a given upload
*
* @apiParam {integer} upload param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /user List Users
* @apiVersion 1.0.0
* @apiName GET-/user
* @apiGroup User
* @apiPermission user
*
* @apidescription
*   Return a list of users that have registered with the service
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListUsers.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListUsers.json} apiSuccess
*/


/**
* @api {post} /user Create User
* @apiVersion 1.0.0
* @apiName POST-/user
* @apiGroup User
* @apiPermission public
*
* @apidescription
*   Create a new user
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/


/**
* @api {patch} /user/:uid Update User
* @apiVersion 1.0.0
* @apiName PATCH-/user/:uid
* @apiGroup User
* @apiPermission admin
*
* @apidescription
*   Update information about a given user - or allow a user to update their own information
*
* @apiParam {integer} uid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/
