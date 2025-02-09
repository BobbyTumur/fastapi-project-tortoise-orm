// This file is auto-generated by @hey-api/openapi-ts

export type Body_file_transfer___login_access_token = {
    grant_type?: (string | null);
    username: string;
    password: string;
    scope?: string;
    client_id?: (string | null);
    client_secret?: (string | null);
};

export type Body_file_transfer___upload_file_from_customer = {
    file: (Blob | File);
};

export type Body_file_transfer___upload_file_to_customer = {
    file: (Blob | File);
};

export type DownloadUrl = {
    url: string;
};

export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};

export type Message = {
    message: string;
};

export type PromptUrl = {
    company_name: string;
    expiry_hours: number;
    type: 'download' | 'upload';
    file_name?: (string | null);
};

export type type = 'download' | 'upload';

export type ResponseURL = {
    url: string;
    username: string;
    password: string;
};

export type S3Object = {
    Key: string;
    LastModified: string;
    Size: number;
};

export type TempUserPublic = {
    id: string;
    company_name: string;
    file_name?: (string | null);
};

export type Token = {
    access_token: string;
    token_type?: string;
};

export type ValidationError = {
    loc: Array<(string | number)>;
    msg: string;
    type: string;
};

export type FileTransferGenerateUrlData = {
    requestBody: PromptUrl;
};

export type FileTransferGenerateUrlResponse = (ResponseURL);

export type FileTransferValidateUrlRouteData = {
    token: string;
};

export type FileTransferValidateUrlRouteResponse = (boolean);

export type FileTransferGetCurrentTempUserResponse = (TempUserPublic);

export type FileTransferLoginAccessTokenData = {
    formData: Body_file_transfer___login_access_token;
};

export type FileTransferLoginAccessTokenResponse = (Token);

export type FileTransferUploadFileToCustomerData = {
    formData: Body_file_transfer___upload_file_to_customer;
};

export type FileTransferUploadFileToCustomerResponse = (Message);

export type FileTransferUploadFileFromCustomerData = {
    formData: Body_file_transfer___upload_file_from_customer;
};

export type FileTransferUploadFileFromCustomerResponse = (Message);

export type FileTransferListFilesData = {
    folder: string;
};

export type FileTransferListFilesResponse = (Array<S3Object>);

export type FileTransferDownloadFileData = {
    fileName: string;
};

export type FileTransferDownloadFileResponse = (DownloadUrl);

export type FileTransferDownloadOwnFileResponse = (DownloadUrl);

export type FileTransferDeleteFileData = {
    fileName: string;
};

export type FileTransferDeleteFileResponse = (Message);