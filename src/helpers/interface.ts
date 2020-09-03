import { Part } from './Part';

export interface Header {
    name: string;
    value: string;
}

export interface Payload {
    partId: string;
    mimeType: string;
    filename: string;
    headers: Header[];
    parts: Part[];
}

export interface Body {
    attachmentId?: string;
    data: string;
}

export enum MIME {
    TEXT = 'text/plain',
    HTML = 'text/html',
}

export interface GetEmailsParams {
    total: number;
    q: string;
}

export interface GetListOptions {
    userId?: string | number;
    total?: number;
    q?: string;
}


export interface AuthParams {
    credentials: Credentials;
    token: Token;
}

export interface GmailParams extends AuthParams { }

export interface Token {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

export interface Credentials {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: [
        string,
        string,
    ]
}

export interface GmailListItem {
    id: string;
    threadId: string;
}

export interface AuthParamsJwtAuthParam {
    jwtKey?: string;
    jwtKeyPath?: string;
}
