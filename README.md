# BDE Backend

This project is the code for the backend of the BDE website

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
