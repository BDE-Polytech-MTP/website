# BDE Backend

This project is the code for the backend of the BDE website

## Development

Clone the repository, run `git submodule init` and `git submodule update`, then install dependencies `npm install`.

### Using docker

You can setup an entire development environment if you have docker installed on your machine. Docker will be used to deploy a `postgres` database.
Use the following command to start the database, the backend and the frontend : `npm run start:docker`

> Note: If it's the first time you're running the command, docker has to pull postgres image and the backend will exit before database get setup.
> So avoid that, run `npm run start:docker:database`, wait for docker container to start and stop it. Then run `npm run start:docker`

Here is the list of all subcommands available when developing using docker:

* `npm run start:docker` - runs the database docker container, the backend in dev mode, and the frontend in dev mode
* `npm run start:docker:database` - runs the database docker container
* `npm run start:docker:website` - runs the backend in dev mode, and the frontend in dev mode
* `npm run start:docker:backend` - runs the backend in dev mode with environment variables present in `compose.env` file
* `npm run start:docker:front` - runs the frontend in dev mode
* `npm run docker:database:inspect` - runs the `psql` command in postgres docker container

### Using own deployed database

You can use a local/remote database by providing credentials in your environment variables (you can create a `.env` at the root of the project to define them). Please refer
to the [environment variables section](#environment-variables) to check which variables need to be defined for the backend to start.

> Note: for mailing, you can define `MAILING_USE_TEST_ACCOUNT` to `1` to avoid specifying credentials and host.

Once all environment variables defined, you can run the backend using `npm run start:dev` and frontend using `cd website-front && npm run dev`.

## Deployment

### Environment variables

* `DATABASE_URL` - The URL to the postgres database to use
* `SITE_URL` - The base URL of the website (with protocol, without trailing slash)
* Mailing
    * `MAILING_RECIPIENT` - The mail address to use to send mails to users
    * `MAILING_HOST` - The URL to the SMTP to authenticate to
    * `MAILING_USERNAME` - The username to authenticate to the SMTP server
    * `MAILING_PASSWORD` - The password to authenticate to the SMTP server
* `JWT_SECRET` - The secret passphrase to sign JWTs
* `API_URL` - The URL to be used by the front SPA to make API calls
