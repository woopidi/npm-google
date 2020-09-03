import { Email } from './helpers/Email';
import { gmail_v1 } from 'googleapis';
import { GetListOptions, GetEmailsParams, GmailParams, GmailListItem } from './helpers/interface';
import { Auth } from './helpers/auth';

export class Gmail extends Auth {

    constructor(params: GmailParams) {
        super(params);
    }

    get gmail(): gmail_v1.Gmail {
        return this.google.gmail({ version: 'v1', auth: this.auth });
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async listLabels(userId = 'me'): Promise<any[]> {
        await this.authorize();

        return new Promise((resolve, reject) => {
            this.gmail.users.labels.list({
                userId
            }, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    const labels = res.data.labels;
                    if (labels.length) {
                        resolve(labels)
                    } else {
                        resolve([])
                    }
                }
            });
        });
    }

    async getList(options: GetListOptions = {}): Promise<GmailListItem[]> {
        await this.authorize();
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.list({
                // @ts-ignore
                userId: options.userId || 'me',
                q: options.q || '',
                maxResults: options.total || 10
                // format: 'raw',
            }, (err, res) => {
                if (err) {
                    console.log(err)
                    // reject('The API returned an error: ' + err);
                } else {
                    resolve(res.data.messages);
                }
            })
        });
    };

    async getMessage(email): Promise<Email> {
        await this.authorize();

        return new Promise((resolve, reject) => {
            this.gmail.users.messages.get({
                userId: 'me',
                id: email.id,
                format: 'full',
            }, (err, res) => {
                if (err) {
                    reject('The API returned an error: ' + err);
                } else {
                    resolve(new Email(res.data));
                }
            });
        });
    };


    async getAttachment(attachmentId: string, messageId: string, userId = 'me'): Promise<any> {
        await this.authorize();

        return new Promise((resolve, reject) => {
            this.gmail.users.messages.attachments.get({
                'id': attachmentId,
                'messageId': messageId,
                'userId': userId
            }, (err, attachment) => {
                if (err) {
                    reject('The API returned an error: ' + err);
                } else {
                    resolve(attachment);
                }
            });
        });
    }

    async getEmails(params: GetEmailsParams): Promise<any> {
        await this.authorize();
        const emailList = await this.getList(params);
        return await Promise.all(emailList.map(async (email) => await this.getMessage(email)));
    }
}

