Eager Beaver
============

![Eager Beaver](https://dl.dropboxusercontent.com/u/41921564/eagerbeaver.png)

http://eagerbeaver.io

Eager Beaver is a specialized build tool to enable simple deployment of StaticStack-based websites. StaticStack is a tech stack for static website generation using [Metalsmith](http://www.metalsmith.io/).

Overview
--------
The goal is to build and deploy a website from source stored in a Github repo.

1. Developer pushes code to Github repo
2. Github Webhook posts data to Eager Beaver Job Manager
3. Job Manager creates a build job on the build queue
4. One or more Build Workers polls the build queue for build jobs, builds and deploys the code.

Setup
-----
This app relies on Amazon Web Services for infrastructure and deployment.

In order to setup the app you need an AWS account, and you need do the following: 
 
- Set up S3 - For deploying websites
- Set up SQS - Job queue handling
- Set up RDS - Job info database
- Set up IAM user with access to S3/SQS/RDS, put credentials in s3config.json (see s3config.json.sample)

Testing
-------

 - Install [ngrok](https://ngrok.com/download)
 - Start local Job Manager server: `node server`
 - Unzip and start ngrok at port 8000: `./ngrok 8000`
 - Set up ngrok url (http://somethingsomething.ngrok.com) as webhook url under Service Hooks for some Staticstack-based GH repo