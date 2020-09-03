
import { Auth } from './helpers/auth';
import { createWriteStream } from 'fs';
import { drive_v3 } from 'googleapis';
import { GaxiosResponse } from './helpers/common';

interface Folder {
    id: string;
    name: string;
}

export class Drive extends Auth {

    version: 'v3';

    get drive(): drive_v3.Drive {
        return this.google.drive({ version: 'v3', auth: this.auth });
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async listFiles(params: drive_v3.Params$Resource$Files$List): Promise<GaxiosResponse<drive_v3.Schema$FileList>> {
        await this.authorize();
        return this.drive.files.list(params);
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async listFiles1(params: drive_v3.Params$Resource$Files$List): Promise<[any | null, GaxiosResponse<drive_v3.Schema$FileList>]> {
        await this.authorize();
        return new Promise(resolve => {
            this.drive.files.list(params, (err, res) => resolve([err, res]))
        });
    }

    async listFolders(params: { folderId?: string }): Promise<GaxiosResponse<drive_v3.Schema$FileList>> {
        await this.authorize();

        const q = [
            `trashed=false`,
            `mimeType = 'application/vnd.google-apps.folder'`
        ];
        if (params.folderId) q.push(`'${params.folderId}' in parents`);

        return this.drive.files.list({
            q: q.join(' and '),
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive' // A comma-separated list of spaces to query within the corpus. Supported values are 'drive', 'appDataFolder' and 'photos'.
        });
    }

    // async listFolders(params: { folderId?: string }): Promise<[any | null, Folder[]]> {
    //     await this.authorize();
    //     const q = [`mimeType = 'application/vnd.google-apps.folder'`];
    //     if (params.folderId) q.push(`'${params.folderId}' in parents`);
    //     return new Promise(resolve => {
    //         this.drive.files.list({
    //             // q: "mimeType='application/pdf'",
    //             q: q.join(' and '),
    //             fields: 'nextPageToken, files(id, name)',
    //             spaces: 'drive' // A comma-separated list of spaces to query within the corpus. Supported values are 'drive', 'appDataFolder' and 'photos'.
    //         }, (err, res) => resolve([err, (res.data.files || []) as Folder[]]))
    //     });
    // }

    // https://developers.google.com/drive/api/v3/ref-search-terms
    // async findFolder(name: string): Promise<[any, OutputFindFolder | null]> {
    //     await this.authorize();
    //     const [err, res] = await this.listFolders();
    //     if (err) {
    //         return [err, null];
    //     }
    //     // @ts-ignore
    //     return [null, res.files.find(folder => folder.name === name)];
    // }

    async createFolder(params: { name: string, parentId?: string }): Promise<[any, string]> {
        await this.authorize();
        const resource = {
            name: params.name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [],
        };
        if (params.parentId) resource.parents.push(params.parentId)
        return new Promise((resolve) => {
            this.drive.files.create({
                //@ts-ignore
                resource,
                fields: 'id',
            }, (err, res) => resolve([err, res.data.id]))
        })
    }

    async uploadFile(params: ParamsUploadFilee): Promise<[any, { id: string }]> {
        await this.authorize();
        return new Promise((resolve) => {
            this.drive.files.create({
                media: {
                    body: params.body,
                    mimeType: params.mimeType,
                },
                // @ts-ignore
                resource: {
                    name: params.name,
                    parents: [params.folderId],
                },
                fields: 'id',
            }, (err, res) => resolve([err, res.data]))
        })
    }
}

interface OutputFindFolder {
    id?: string;
    name: string;
}

interface ParamsUploadFilee {
    name: string;
    folderId: string,
    mimeType: string;
    body: string | Buffer | any;
}

type FolderId = string;