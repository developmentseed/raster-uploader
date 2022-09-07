import Mailgen from 'mailgen';
import Err from '@openaddresses/batch-error';
import AWS from 'aws-sdk';

/**
 * @class
 *
 * @prop {Config} config Serverwide Config
 * @prop {Object} mailGenerator MailGen Generation API
 */
export default class Email {
    constructor(config) {
        this.config = config;
        this.ses = new AWS.SES({
            region: process.env.AWS_DEFAULT_REGION
        });

        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Raster Uploader',
                link: config.Frontend
            }
        });
    }

    /**
     * Send an email verification to the user
     *
     * @param {Object} user
     * @param {String} user.username
     * @param {String} user.email
     * @param {String} user.token
     */
    async verify(user) {
        const email = {
            body: {
                name: user.email,
                intro: 'Raster Uploader Email Confirmation',
                action: {
                    instructions: `Hello ${user.username}, to finish creating your account, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Verify Email',
                        link: `${this.config.Frontend}/#/login/verify?token=${user.token}`
                    }
                },
                outro: ''
            }
        };

        try {
            return await this.send(user.email, 'Raster Uploader Email Verification', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err, 'Internal User Confirmation Error');
        }
    }

    async forgot(user) {
        const email = {
            body: {
                name: user.email,
                intro: 'Raster Uploader Password Reset',
                action: {
                    instructions: `Hello ${user.username}, to reset your password, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Password Reset',
                        link: `${this.config.Frontend}/#/login/reset?token=${user.token}`
                    }
                },
                outro: ''
            }
        };

        try {
            return await this.send(user.email, 'Raster Uploader Password Reset', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err, 'Internal User Forgot Error');
        }
    }

    /**
     * Send an email via the AWS SES Service
     * Note: All emails are sent from robot@<domain>
     *
     * @param {string} email email recipient
     * @param {string} subject email subject
     * @param {string} body HTML body to send
     */
    async send(email, subject, body) {
        return await this.ses.sendEmail({
            Destination: {
                ToAddresses: [email]
            },
            Source: this.config.FromEmailAddress,
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: body
                    }
                }
            }
        }).promise();
    }
}
