const nodeFetch = require("node-fetch");
const { Base64 } = require("js-base64");

module.exports = class Guard {
    constructor(accountSid, authToken) {
        if (accountSid === undefined) {
            throw new Error("Context argument is required.");
        }

        if (authToken === undefined) {
            throw new Error("Event argument is required.");
        }

        this.accountSid = accountSid;
        this.authToken = authToken;
    }

    async allowed(token, allowedRoles, callback) {
        try {
            const tokenResponse = await this.validateToken(token);
            if (!tokenResponse.valid) {
                if (callback) {
                    this.rejectRequest(tokenResponse.message);
                }
                throw new Error(response);
            }

            if (allowedRoles) {
                const roleValid = this.checkRole(
                    tokenResponse.roles,
                    allowedRoles
                );
                if (roleValid === false) {
                    if (callback) {
                        this.rejectRequest(tokenResponse.message);
                    }
                    throw new Error(response);
                }
            }
            return true;
        } catch (err) {
            return false;
        }
    }

    checkRole(agentRoles, allowedRoles) {
        const validRoles = agentRoles.filter((ar) => {
            return allowedRoles.includes(ar);
        });

        if (validRoles.length > 0) {
            return true;
        }

        return false;
    }

    rejectRequest(message) {
        const response = new Twilio.Response();
        response.appendHeader("Access-Control-Allow-Origin", "*");
        response.appendHeader("Access-Control-Allow-Methods", "GET POST");
        response.appendHeader("Content-Type", "application/json");
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatusCode(401);
        response.setBody({
            status: 401,
            message: "Authentication token failed validation",
            detail: message,
        });

        this.callback(null, response);
    }

    async validateToken(token) {
        try {
            const { token } = this.event;
            const tokenValidationApi = `https://iam.twilio.com/v1/Accounts/${this.context.ACCOUNT_SID}/Tokens/validate`;
            const fetchResponse = await nodeFetch(tokenValidationApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Base64.encode(
                        `${this.context.ACCOUNT_SID}:${this.context.AUTH_TOKEN}`
                    )}`,
                },
                body: JSON.stringify({
                    token,
                }),
            });
            const tokenResponse = await fetchResponse.json();

            return tokenResponse;
        } catch (err) {
            return false;
        }
    }
};
