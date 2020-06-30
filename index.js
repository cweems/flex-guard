const nodeFetch = require("node-fetch");
const { Base64 } = require("js-base64");

module.exports = class Guard {
    constructor(context, event, callback, options) {
        this.context = context;
        this.event = event;
        this.callback = callback;
        this.options = options;
    }

    async allow() {
        try {
            const tokenResponse = await this.validateToken();
            console.log(tokenResponse);
            if (!tokenResponse.valid) {
                this.rejectRequest(tokenResponse.message);
                throw new Error(response);
            }
            return true;
        } catch (err) {
            return false;
        }
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
            message: "Your authentication token failed validation",
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
