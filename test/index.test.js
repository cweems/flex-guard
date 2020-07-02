var assert = require("assert");
var sinon = require("sinon");
var expect = require("chai").expect;
var Guard = require("../index.js");

const {
    invalidAccountResponse,
    invalidAccessTokenResponse,
    validTokenResponse,
    noMatchingRoleResponse,
    matchingRoleResponse,
} = require("./support.js");

describe("Guard", function () {
    let context = {};
    let event = {};
    let callback = {};

    describe("#constructor", function () {
        it("should throw an error if context is missing", async function () {
            expect(function () {
                const guard = new Guard(undefined, event).should.throw();
            }).to.throw("Context argument is required.");
        });

        it("should throw an error if event is missing", async function () {
            expect(function () {
                const guard = new Guard(context, undefined).should.throw();
            }).to.throw("Event argument is required.");
        });
    });

    describe("#allow", function () {
        it("allow method should be a function", function () {
            const guard = new Guard(context, event, callback);
            assert.equal(typeof guard.allow, "function");
        });

        it("should throw an error if account SID is not correct", async function () {
            const guard = new Guard(context, event, callback);
            sinon.stub(guard, "validateToken").returns(invalidAccountResponse);

            assert.equal(await guard.allow(), false);
        });

        it("should return false if token is invalid", async function () {
            const guard = new Guard(context, event, callback);
            sinon
                .stub(guard, "validateToken")
                .returns(invalidAccessTokenResponse);

            assert.equal(await guard.allow(), false);
        });

        it("should return true if token is valid", async function () {
            const guard = new Guard(context, event, callback);
            sinon.stub(guard, "validateToken").returns(validTokenResponse);

            assert.equal(await guard.allow(), true);
        });

        describe("#checkRole", function () {
            it("returns true if role is included in list", async function () {
                const guard = new Guard(context, event, callback, [
                    "agent",
                    "admin",
                ]);
                sinon
                    .stub(guard, "validateToken")
                    .returns(matchingRoleResponse);

                assert.equal(await guard.allow(), true);
            });

            it("returns false if role is not included in list", async function () {
                const guard = new Guard(context, event, callback, [
                    "admin",
                    "supervisor",
                ]);
                sinon
                    .stub(guard, "validateToken")
                    .returns(noMatchingRoleResponse);

                assert.equal(await guard.allow(), false);
            });

            it("calls #rejectRequest if callback is supplied and role is not included in list", async function () {
                const guard = new Guard(context, event, callback, [
                    "admin",
                    "supervisor",
                ]);
                sinon
                    .stub(guard, "validateToken")
                    .returns(noMatchingRoleResponse);
                const rejectRequestSpy = sinon.spy(guard, "rejectRequest");
                await guard.allow();
                assert.equal(rejectRequestSpy.called, true);
            });

            it("does not call #rejectRequest if callback is not supplied and role is not included in list", async function () {
                const guard = new Guard(context, event, undefined, [
                    "admin",
                    "supervisor",
                ]);
                sinon
                    .stub(guard, "validateToken")
                    .returns(noMatchingRoleResponse);
                const rejectRequestSpy = sinon.spy(guard, "rejectRequest");
                await guard.allow();
                assert.equal(rejectRequestSpy.called, false);
            });
        });

        describe("#rejectRequest", function () {
            it("should be called if callback is not null", async function () {
                const guard = new Guard(context, event, callback);

                sinon
                    .stub(guard, "validateToken")
                    .returns(invalidAccessTokenResponse);
                const rejectRequestSpy = sinon.spy(guard, "rejectRequest");

                await guard.allow();

                assert.equal(rejectRequestSpy.called, true);
            });

            it("should not be called if callback is null", async function () {
                callback = null;
                const guard = new Guard(context, event, callback);

                sinon
                    .stub(guard, "validateToken")
                    .returns(invalidAccessTokenResponse);
                const rejectRequestSpy = sinon.spy(guard, "rejectRequest");

                await guard.allow();

                assert.equal(rejectRequestSpy.called, false);
            });

            it("should not be called if callback is undefined", async function () {
                callback = undefined;
                const guard = new Guard(context, event, callback);

                sinon
                    .stub(guard, "validateToken")
                    .returns(invalidAccessTokenResponse);
                const rejectRequestSpy = sinon.spy(guard, "rejectRequest");

                await guard.allow();

                assert.equal(rejectRequestSpy.called, false);
            });
        });
    });

    describe("#checkRole", function () {
        it("returns true if role is included in list", async function () {
            const guard = new Guard(context, event, callback, [
                "agent",
                "admin",
            ]);

            assert.equal(guard.checkRole(["admin", "supervisor"]), true);
        });

        it("returns false if role is not included in list", async function () {
            const guard = new Guard(context, event, callback, [
                "agent",
                "admin",
            ]);

            assert.equal(guard.checkRole(["custom", "supervisor"]), false);
        });
    });
});
