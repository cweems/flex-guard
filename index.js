const nodeFetch = require("node-fetch");
const { Base64 } = require("js-base64");

module.exports = class Guard {
    constructor(context, event, callback, allowedRoles) {
        if (context === undefined) {
            throw new Error("Context argument is required.");
        }

        if (event === undefined) {
            throw new Error("Event argument is required.");
        }

        this.context = context;
        this.event = event;
        this.callback = callback;
        this.allowedRoles = allowedRoles;
    }

    async allowed() {
        try {
            const tokenResponse = await this.validateToken();
            if (!tokenResponse.valid) {
                if (this.callback) {
                    this.rejectRequest(tokenResponse.message);
                }
                throw new Error(response);
            }

            if (this.allowedRoles) {
                const roleValid = this.checkRole(tokenResponse.roles);
                if (roleValid === false) {
                    if (this.callback) {
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

    checkRole(agentRoles) {
        const validRoles = agentRoles.filter((ar) => {
            return this.allowedRoles.includes(ar);
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

    async validateToken() {
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
