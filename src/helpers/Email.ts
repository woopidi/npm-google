
import { Part } from './Part';
import { Payload } from './interface';
export * from './interface';

export class Email {

    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    sizeEstimate: number;
    historyId: string;
    internalDate: string;
    payload: Payload;

    /**
     * The email as a text message
     */
    text: string = '';
    private _rows: string[] = [];

    constructor(message: any) {
        Object.assign(this, message);
        this.payload.parts = this.payload.parts.map(part => new Part(part, this.id));
        // this.setDecodedMessage();
    }

    /**
     * The subject of the email
     */
    get subject(): string {
        return this.getHeader('Subject');
    }

    get attachments(): Part[] {
        return this.payload.parts.filter(part => part.filename !== '');
    }

    get pdfAttachments(): Part[] {
        return this.attachments.filter(part => part.fileExtension === 'pdf');
    }

    /**
     * The Date the email was received
     */
    get date(): Date {
        return new Date(this.getHeader('Date'));
    }

    get rows(): string[] {
        if (this._rows.length === 0) {
            this._rows = this.text.match(/[^\r\n]+/g);
        }
        return this._rows;
    }

    getHeader(headerName: string): string {
        return this.payload.headers.find(({ name }) => name === headerName)?.value || '';
    }

    getTextMessage() {
        return this.payload.parts[0].body;
    }

    private setDecodedMessage(): void {
        if (this.payload.parts[0].body) {
            this.text = Buffer.alloc(
                this.payload.parts[0].body.data.length,
                this.payload.parts[0].body.data,
                "base64"
            ).toString();
        }
    }
}
