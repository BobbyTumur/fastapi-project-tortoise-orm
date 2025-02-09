// This file is auto-generated by @hey-api/openapi-ts

export type AlertConfigCreate = {
	has_extra_email?: boolean | null;
	has_teams_slack?: boolean | null;
	mail_from?: string | null;
	mail_cc?: string | null;
	mail_to?: string | null;
	alert_mail_title?: string | null;
	alert_mail_body?: string | null;
	recovery_mail_title?: string | null;
	recovery_mail_body?: string | null;
	extra_mail_to?: string | null;
	extra_mail_body?: string | null;
	slack_link?: string | null;
	teams_link?: string | null;
};

export type AlertConfigPublic = {
	has_extra_email?: boolean | null;
	has_teams_slack?: boolean | null;
	mail_from?: string | null;
	mail_cc?: string | null;
	mail_to?: string | null;
	alert_mail_title?: string | null;
	alert_mail_body?: string | null;
	recovery_mail_title?: string | null;
	recovery_mail_body?: string | null;
	extra_mail_to?: string | null;
	extra_mail_body?: string | null;
	slack_link?: string | null;
	teams_link?: string | null;
};

export type Body_file_transfer___login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};

export type Body_file_transfer___upload_file_from_customer = {
	file: Blob | File;
};

export type Body_file_transfer___upload_file_to_customer = {
	file: Blob | File;
};

export type Body_login___login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};

export type DownloadUrl = {
	url: string;
};

export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};

export type LogPublic = {
	id: number;
	start_time: string | null;
	end_time: string | null;
	elapsed_time?: number | null;
	is_ok: boolean | null;
	screenshot?: string | null;
	content?: string | null;
};

export type Message = {
	message: string;
};

export type MessageFromClient = {
	token: string;
	os: string;
	notification_id: string;
	is_silent: boolean;
};

export type NewPassword = {
	token: string;
	new_password: string;
};

export type PromptUrl = {
	company_name: string;
	expiry_hours: number;
	type: "download" | "upload";
	file_name?: string | null;
};

export type type = "download" | "upload";

export type PublishConfigCreate = {
	alert_publish_title?: string | null;
	alert_publish_body?: string | null;
	show_influenced_user?: boolean | null;
	send_mail?: boolean | null;
};

export type PublishConfigPublic = {
	alert_publish_title?: string | null;
	alert_publish_body?: string | null;
	show_influenced_user?: boolean | null;
	send_mail?: boolean | null;
};

export type QRUri = {
	uri: string;
};

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

export type ServiceConfig = {
	name: string;
	sub_name: string;
	has_alert_notification?: boolean;
	has_auto_publish?: boolean;
	id: string;
	alert_config: AlertConfigPublic | null;
	publish_config: PublishConfigPublic | null;
};

export type ServiceCreate = {
	name: string;
	sub_name: string;
	has_alert_notification?: boolean;
	has_auto_publish?: boolean;
};

export type ServiceId = {
	id: string;
};

export type ServiceLogs = {
	name: string;
	sub_name: string;
	has_alert_notification?: boolean;
	has_auto_publish?: boolean;
	id: string;
	logs: Array<LogPublic> | null;
};

export type ServicePublic = {
	name: string;
	sub_name: string;
	has_alert_notification?: boolean;
	has_auto_publish?: boolean;
	id: string;
};

export type ServicesPublic = {
	data: Array<ServicePublic>;
	count: number;
};

export type ServiceUpdate = {
	has_alert_notification?: boolean;
	has_auto_publish?: boolean;
};

export type TempUserPublic = {
	id: string;
	company_name: string;
	file_name?: string | null;
};

export type Token = {
	access_token: string;
	token_type?: string;
};

export type TokenIn = {
	token: string;
};

export type TokenOut = {
	token: string;
	id: number;
};

export type TokensOut = {
	data: Array<TokenOut>;
	count: number;
};

export type TOTPToken = {
	token: string;
};

export type UpdatePassword = {
	current_password: string;
	new_password: string;
};

export type Usernames = {
	usernames: Array<string>;
};

export type UserPublic = {
	username: string;
	email: string;
	is_superuser?: boolean;
	can_edit?: boolean;
	is_active?: boolean;
	is_totp_enabled?: boolean;
	id: string;
	services: Array<ServiceId>;
};

export type UserRegister = {
	username: string;
	email: string;
	is_superuser?: boolean;
	can_edit?: boolean;
	is_active?: boolean;
	is_totp_enabled?: boolean;
};

export type UsersPublic = {
	data: Array<UserPublic>;
	count: number;
};

export type UserUpdate = {
	username: string;
	is_superuser?: boolean;
	can_edit?: boolean;
	is_active?: boolean;
};

export type UserUpdateServices = {
	added_services?: Array<string>;
};

export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};

export type FileTransferGenerateUrlData = {
	requestBody: PromptUrl;
};

export type FileTransferGenerateUrlResponse = ResponseURL;

export type FileTransferValidateUrlRouteData = {
	token: string;
};

export type FileTransferValidateUrlRouteResponse = boolean;

export type FileTransferGetCurrentTempUserResponse = TempUserPublic;

export type FileTransferLoginAccessTokenData = {
	formData: Body_file_transfer___login_access_token;
};

export type FileTransferLoginAccessTokenResponse = Token;

export type FileTransferUploadFileToCustomerData = {
	formData: Body_file_transfer___upload_file_to_customer;
};

export type FileTransferUploadFileToCustomerResponse = Message;

export type FileTransferUploadFileFromCustomerData = {
	formData: Body_file_transfer___upload_file_from_customer;
};

export type FileTransferUploadFileFromCustomerResponse = Message;

export type FileTransferListFilesData = {
	folder: string;
};

export type FileTransferListFilesResponse = Array<S3Object>;

export type FileTransferDownloadOwnFileResponse = DownloadUrl;

export type FileTransferDownloadFileData = {
	fileName: string;
};

export type FileTransferDownloadFileResponse = DownloadUrl;

export type FileTransferDeleteFileData = {
	fileName: string;
};

export type FileTransferDeleteFileResponse = Message;

export type FirebaseHealthCheckResponse = Message;

export type FirebaseHealthCheckPhoneResponse = Message;

export type FirebaseReceiveMessageData = {
	requestBody: MessageFromClient;
};

export type FirebaseReceiveMessageResponse = Message;

export type FirebaseGetTokensResponse = TokensOut;

export type FirebaseRegisterTokenData = {
	requestBody: TokenIn;
};

export type FirebaseRegisterTokenResponse = Message;

export type LoginLoginAccessTokenData = {
	formData: Body_login___login_access_token;
};

export type LoginLoginAccessTokenResponse = Token;

export type LoginValidateTotpData = {
	requestBody: TOTPToken;
};

export type LoginValidateTotpResponse = Token;

export type LoginRefreshAccessTokenResponse = Token;

export type LoginRecoverPasswordData = {
	email: string;
};

export type LoginRecoverPasswordResponse = Message;

export type LoginResetPasswordData = {
	requestBody: NewPassword;
};

export type LoginResetPasswordResponse = Message;

export type LoginSetUpPasswordData = {
	requestBody: NewPassword;
};

export type LoginSetUpPasswordResponse = Message;

export type ServicesGetServicesData = {
	limit?: number;
	skip?: number;
};

export type ServicesGetServicesResponse = ServicesPublic;

export type ServicesCreateServiceData = {
	requestBody: ServiceCreate;
};

export type ServicesCreateServiceResponse = ServicePublic;

export type ServicesGetServiceData = {
	serviceId: string;
};

export type ServicesGetServiceResponse = ServicePublic;

export type ServicesUpdateServiceData = {
	requestBody: ServiceUpdate;
	serviceId: string;
};

export type ServicesUpdateServiceResponse = ServicePublic;

export type ServicesDeleteServiceData = {
	serviceId: string;
};

export type ServicesDeleteServiceResponse = Message;

export type ServicesGetServiceUsersData = {
	serviceId: string;
};

export type ServicesGetServiceUsersResponse = Usernames;

export type ServicesGetServiceConfigData = {
	serviceId: string;
};

export type ServicesGetServiceConfigResponse = ServiceConfig;

export type ServicesUpdateServiceAlertConfigData = {
	requestBody: AlertConfigCreate;
	serviceId: string;
};

export type ServicesUpdateServiceAlertConfigResponse = Message;

export type ServicesUpdateServicePublishConfigData = {
	requestBody: PublishConfigCreate;
	serviceId: string;
};

export type ServicesUpdateServicePublishConfigResponse = Message;

export type ServicesGetServiceLogsData = {
	limit?: number;
	serviceId: string;
	skip?: number;
};

export type ServicesGetServiceLogsResponse = ServiceLogs;

export type TotpEnableTotpResponse = QRUri;

export type TotpTotpLoginVerifyData = {
	requestBody: TOTPToken;
};

export type TotpTotpLoginVerifyResponse = Message;

export type TotpDisableTotpResponse = Message;

export type TotpAdminDisableTotpData = {
	userId: string;
};

export type TotpAdminDisableTotpResponse = Message;

export type UsersReadUsersData = {
	limit?: number;
	skip?: number;
};

export type UsersReadUsersResponse = UsersPublic;

export type UsersReadUserMeResponse = UserPublic;

export type UsersReadUserByIdData = {
	userId: string;
};

export type UsersReadUserByIdResponse = UserPublic;

export type UsersUpdateUserData = {
	requestBody: UserUpdate;
	userId: string;
};

export type UsersUpdateUserResponse = UserPublic;

export type UsersDeleteUserData = {
	userId: string;
};

export type UsersDeleteUserResponse = Message;

export type UsersRegisterUserData = {
	requestBody: UserRegister;
};

export type UsersRegisterUserResponse = Message;

export type UsersUpdatePasswordMeData = {
	requestBody: UpdatePassword;
};

export type UsersUpdatePasswordMeResponse = Message;

export type UsersServicesGetUserServicesData = {
	userId: string;
};

export type UsersServicesGetUserServicesResponse = Array<ServicePublic>;

export type UsersServicesAddServicesToUserData = {
	requestBody: UserUpdateServices;
	userId: string;
};

export type UsersServicesAddServicesToUserResponse = Message;

export type UtilsTestEmailData = {
	emailTo: string;
};

export type UtilsTestEmailResponse = Message;

export type UtilsHealthCheckResponse = boolean;
