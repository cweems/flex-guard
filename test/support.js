module.exports.invalidAccountResponse = {
    code: 20404,
    message:
        "The requested resource /Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Tokens/validate was not found",
    more_info: "https://www.twilio.com/docs/errors/20404",
    status: 404,
};

module.exports.invalidAccessTokenResponse = {
    code: 20101,
    worker_sid: null,
    roles: null,
    realm_user_id: null,
    valid: false,
    expiration: null,
    message: "Invalid Access Token",
    identity: null,
};

module.exports.validTokenResponse = {
    code: 0,
    worker_sid: "WKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    roles: ["admin"],
    realm_user_id: null,
    valid: true,
    expiration: "2020-07-01T20:33:07Z",
    message: null,
    identity: "whocares",
};

module.exports.noMatchingRoleResponse = {
    code: 0,
    worker_sid: "WKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    roles: ["no", "match"],
    realm_user_id: null,
    valid: true,
    expiration: "2020-07-01T20:33:07Z",
    message: null,
    identity: "whocares",
};

module.exports.matchingRoleResponse = {
    code: 0,
    worker_sid: "WKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    roles: ["admin", "supervisor"],
    realm_user_id: null,
    valid: true,
    expiration: "2020-07-01T20:33:07Z",
    message: null,
    identity: "whocares",
};
