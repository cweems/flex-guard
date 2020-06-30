const nodeFetch = require("node-fetch");
const { Base64 } = require("js-base64");

function constructResponse() {
    const response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET POST");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function guard(context, event, callback) {
    try {
        const { token } = event;
        const tokenValidationApi = `https://iam.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/validate`;
        const fetchResponse = await nodeFetch(tokenValidationApi, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Base64.encode(
                    `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`
                )}`,
            },
            body: JSON.stringify({
                token,
            }),
        });
        const tokenResponse = await fetchResponse.json();
        console.log("Token validation response properties:");
        Object.keys(tokenResponse).forEach((key) => {
            console.log(`${key}: ${tokenResponse[key]}`);
        });
        if (!tokenResponse.valid) {
            response.setStatusCode(401);
            response.setBody({
                status: 401,
                message: "Your authentication token failed validation",
                detail: tokenResponse.message,
            });
            callback(null, response);
            throw new Error(response);
        }

        return true;
    } catch (err) {
        return false;
    }
};
