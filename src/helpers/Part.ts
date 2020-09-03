
import { Header, Body, MIME } from './interface';
import { Gmail } from '../gmail';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { StringDecoder } from 'string_decoder';

export class Part {

    emailId: string;
    partId: string;
    mimeType: MIME;
    filename: string;
    fileExtension: string;
    headers: Header[];
    body: Body;

    constructor(part: any, emailId: string) {
        Object.assign(this, part);
        this.emailId = emailId;

        if (this.filename) {
            const arr = this.filename.split('.');
            this.fileExtension = arr[arr.length - 1];
        }
    }

    async base64(gmail: Gmail): Promise<Buffer> {
        const attachment = await gmail.getAttachment(this.body.attachmentId, this.emailId, 'me');
        return Buffer.from(attachment.data.data, 'base64');
    }

    async download(gmail: Gmail, outputFilePath: string): Promise<string> {
        var bitmap = await this.base64(gmail)
        writeFileSync(outputFilePath, bitmap);
        return outputFilePath;
    }

    async downloadPDFWithPassword(gmail: Gmail, inputFilePath: string, password: string, outputFilePath?: string): Promise<string> {
        await this.download(gmail, inputFilePath);

        return new Promise((resolve, reject) => {
            const qpdf = spawn('qpdf', [`--password=${password}`, '--decrypt', inputFilePath, outputFilePath]);
            qpdf.stdout.on('data', () => resolve(outputFilePath));
            qpdf.stderr.on('data', data => reject(new Error(data.toString())));
        })
    };
}
