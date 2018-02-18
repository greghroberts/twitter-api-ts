import { unionize, ofType } from 'unionize';
import * as DecodeTypes from 'decode-ts/target/types';
import * as either from 'fp-ts/lib/Either';
import * as option from 'fp-ts/lib/Option';
import * as t from 'io-ts';
import { ObjectClean, ObjectDiff } from 'typelevel-ts';

import Option = option.Option;
import Either = either.Either;

import { defaultOAuthOptions, defaultStatusesHomeTimelineQuery } from './helpers';

export type RequestMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'UPDATE';

//
// Entities
//

// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/user-object
export const User = t.interface({
    id_str: t.string,
    screen_name: t.string,
    time_zone: t.union([t.string, t.null]),
});

export const Tweet = t.interface({
    id_str: t.string,
    created_at: t.string,
    user: User,
    text: t.string,
});
export type TweetT = t.TypeOf<typeof Tweet>;

//
// Responses
//

export const TwitterAPIErrorResponse = t.interface({
    errors: t.array(
        t.interface({
            code: t.number,
            message: t.string,
        }),
    ),
});
export type TwitterAPIErrorResponseT = t.TypeOf<typeof TwitterAPIErrorResponse>;

export const TwitterAPIRequestTokenResponse = t.interface({
    oauth_token: t.string,
    oauth_token_secret: t.string,
    oauth_callback_confirmed: t.string,
});
export type TwitterAPIRequestTokenResponseT = t.TypeOf<typeof TwitterAPIRequestTokenResponse>;

export const TwitterAPIAccessTokenResponse = t.interface({
    oauth_token: t.string,
    oauth_token_secret: t.string,
    user_id: t.string,
    screen_name: t.string,
    x_auth_expires: t.string,
});
export type TwitterAPIAccessTokenResponseT = t.TypeOf<typeof TwitterAPIAccessTokenResponse>;

export const TwitterAPITimelineResponse = t.array(Tweet);
export type TwitterAPITimelineResponseT = t.TypeOf<typeof TwitterAPITimelineResponse>;

export const TwitterAPIAccountVerifyCredentials = User;
export type TwitterAPIAccountVerifyCredentialsT = t.TypeOf<
    typeof TwitterAPIAccountVerifyCredentials
>;

//
// Full responses (either success or error)
//

export const ErrorResponse = unionize({
    JavaScriptError: ofType<{ error: Error }>(),
    APIErrorResponse: ofType<{ apiErrorResponse: TwitterAPIErrorResponseT }>(),
    DecodeError: ofType<{
        decodeError: DecodeTypes.ValidationErrorsError | DecodeTypes.ParsingErrorError;
    }>(),
});
export type ErrorResponse = typeof ErrorResponse._Union;

export type Response<T> = Either<ErrorResponse, T>;

export type RequestTokenResponse = Response<TwitterAPIRequestTokenResponseT>;
export type AccessTokenResponse = Response<TwitterAPIAccessTokenResponseT>;
export type TimelineResponse = Response<TwitterAPITimelineResponseT>;
export type AccountVerifyCredentialsResponse = Response<TwitterAPIAccountVerifyCredentialsT>;

//
// Other
//

export type OAuthOptions = {
    consumerKey: string;
    consumerSecret: string;
    // Required for request_token
    callback: Option<string>;
    token: Option<string>;
    tokenSecret: Option<string>;
    // Required for access_token
    verifier: Option<string>;
};

export type OAuthOptionsInput = ObjectClean<ObjectDiff<OAuthOptions, typeof defaultOAuthOptions>>;

export type StatusesHomeTimelineQuery = {
    count: Option<number>;
    maybeMaxId: Option<string>;
};

export type StatusesHomeTimelineQueryInput = ObjectClean<
    ObjectDiff<StatusesHomeTimelineQuery, typeof defaultStatusesHomeTimelineQuery>
>;

export type SerializedStatusesHomeTimelineQuery = {
    count?: number;
    max_id?: string;
};

export type SerializedOAuthAuthenticateEndpointQuery = { oauth_token: string };
