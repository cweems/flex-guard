var assert = require("assert");
var sinon = require("sinon");
describe("#guard", function () {
    var guard = require("../index.js");

    it("should be a function", function () {
        assert.equal(typeof guard, "function");
    });

    it("should throw an error if context is missing", async function () {
        context = {};
        event = {};
        callback = () => {};
        const result = await guard(event, context, callback);
        assert.equal(result, false);
    });

    it("should throw an error if account SID is not correct", async function () {
        const response = {
            code: 20404,
            message:
                "The requested resource /Accounts/AC2afa9e4e60ab498c9ab17c5db8b983d/Tokens/validate was not found",
            more_info: "https://www.twilio.com/docs/errors/20404",
            status: 404,
        };
        const result = await guard();
    });

    it("should return false if token is invalid", async function () {
        const response = {
            code: 20101,
            worker_sid: null,
            roles: null,
            realm_user_id: null,
            valid: false,
            expiration: null,
            message: "Invalid Access Token",
            identity: null,
        };
        const result = await guard();
    });

    it("should return true if token is valid", async function () {
        const response = {
            code: 0,
            worker_sid: "WKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            roles: ["admin"],
            realm_user_id: null,
            valid: true,
            expiration: "2020-07-01T20:33:07Z",
            message: null,
            identity: "whocares",
        };
        const result = await guard();
    });
});
