import { google, GoogleApis } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFile, writeFile } from 'fs';
import { AuthParams, Credentials, Token } from './interface';
import * as readline from 'readline';

export class Auth {

    private credentials: Credentials;

    private token: Token;

    protected auth: OAuth2Client;

    constructor(params: AuthParams) {
        Object.assign(this, params);
    }

    get google(): GoogleApis {
        return google;
    }

    async authorize(): Promise<void> {
        if (this.auth) return Promise.resolve();

        if (!this.credentials) {
            return Promise.reject('Credentials missing');
        }

        if (!this.token) {
            return Promise.reject('Token missing');
        }

        const { client_id, client_secret, redirect_uris } = this.credentials;

        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        this.auth.setCredentials(this.token);
    }

}