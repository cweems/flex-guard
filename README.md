<h1 align="center">flex-guard</h1>
<p align="center">NPM package that validates requests from Twilio Flex's front-end to back-end services.

`flex-guard` provides a simple API for handling authorization of requests between an agent and Twilio Functions (or your own Node.js app). `flex-guard` checks for a valid agent token, and can also check if the agent certain required roles.

`flex-guard` returns `true` if the request is allowed and `false` if it is not. It will also optionally return automatically return a `401 - Unauthorized` response.

**Disclaimer: This is a personal project and is not supported by Twilio.**

## Use Cases

-   You want to allow a contact center agent to click a button that sends an email to the customer. `flex-guard` will check to see if the user initiating the API call to send the email has a valid token.

-   When an agent's task loads, you want to pull data from a customer data platform. `flex-guard` will check to see that they have a valid token before returning a response to the API call.

-   You want to allow certain agents to perform sensitive tasks like update PII. `flex-guard` will check if they have the required role.

## Usage

### Installation

`$ npm install flex-guard`

You can also add `flex-guard` as a Twilio Functions dependency on the [functions configuration page]('https://www.twilio.com/console/functions/configure').

### Back-End

**Basic usage:**

```javascript
let Guard = require("flex-guard");

const guard = new Guard(ACCOUNT_SID, AUTH_TOKEN);
const allowed = await guard.allowed(token, ["supervisor", "admin"]);
// => true || false
```

**Twilio Function:**

```javascript
let Guard = require("flex-guard");

exports.handler = async function (context, event, callback) {
    const guard = new Guard(context.ACCOUNT_SID, context.AUTH_TOKEN);

    const allowed = await guard.allowed(token, ["supervisor", "admin"]);
    // => true || false
};
```

Optionally, you can pass the `callback` argument of your function and `flex-guard` will automatically return a `401` response if the agent's token or role is invalid:

```javascript
exports.handler = async function (context, event, callback) {
    const guard = new Guard(context.ACCOUNT_SID, context.AUTH_TOKEN);

    const token = event.token;

    const allowed = await guard.allowed(token, ["supervisor"], callback);
    // => true || false + 401 Response using Twilio.Response();
};
```

**Node.js / Express:**

```javascript
let Guard = require("flex-guard");
// & Other dependencies...

router.post("/flex-request", jsonParser, async function (req, res) {
    const guard = new Guard(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
    const allowed = await guard.allowed(req.body.token, ["supervisor"]);
    // => true || false
});
```

### Front-End

In your Flex Plugin, you'll need to include your agent's token in the body of your request:

1. Import `Manager` from `@twilio/flex-ui`
1. Use `Manager` to get the agent's token
1. Include `token` in the body of your request

```javascript
// Import Manager
import { Manager } from "@twilio/flex-ui";

export default class MyComponent extends React.Component {
    async fetchData() {
        // Get the agent's token from Manager
        const manager = Manager.getInstance();
        const token = manager.user.token;

        const response = await fetch(`https://my-env-123.twil.io/my-function`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            // Include the token in the body of your request
            body: `token=${token}`,
        });

        // Handle the response
    }

    // Render your component, etc.
}
```

## Examples

**Send Email**
Only allow an agent to send an email if their token is valid and they have the role `agent`:

```javascript
const Guard = require("flex-guard");
const sgMail = require("@sendgrid/mail");

exports.handler = async function (context, event, callback) {
    const guard = new Guard(context.accountSid, context.authToken);

    const token = event.token;
    // or { token } = event;

    let allowed = await guard.allowed(token, ["agent"], callback);

    if (allowed) {
        sgMail.setApiKey(context.SENDGRID_API_KEY);

        const message = {
            to: "myRecipient@trial.com",
            from: "myEmail@trail.com",
            subject: "My Subject",
            text: "Your email text.",
        };
        sgMail
            .send(message)
            .then(() => {
                const response = new Twilio.Response();
                response.appendHeader("Access-Control-Allow-Origin", "*");
                response.appendHeader(
                    "Access-Control-Allow-Methods",
                    "OPTIONS POST"
                );
                response.appendHeader("Content-Type", "application/json");
                response.appendHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type"
                );
                callback(null, response);
            })
            .catch((err) => {
                callback(err);
            });
    }
};
```

**Start Twilio Studio Flow**
Make an API call from your Flex front-end to start a Twilio Studio SMS survey:

```javascript
const Guard = require("flex-guard");

exports.handler = async function (context, event, callback) {
    const guard = new Guard(context.accountSid, context.authToken);

    const token = event.token;
    // or { token } = event;

    let allowed = await guard.allowed(token, ["agent"], callback);

    if (allowed) {
        const response = new Twilio.Response();
        response.appendHeader("Access-Control-Allow-Origin", "*");
        response.appendHeader(
            "Access-Control-Allow-Methods",
            "OPTIONS POST GET"
        );
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

        client = context.getTwilioClient();

        client.studio
            .flows(context.SURVEY_FLOW_SID)
            .executions.create({
                to: event.toPhoneNumber,
                from: "+14133233662",
            })
            .then((execution) => {
                callback(null, response);
            })
            .catch((err) => {
                callback(err);
            });
    }
};
```

## Reference

### Guard() `class`

#### Arguments

**accountSid**
|Type: `string`|Required|
|---|---|

Your Twilio Account SID.

**authToken**
|Type: `string`|Required|
|---|---|

Your Twilio Auth Token.

#

### allowed() `method`

**token**
|Type: `string`|Required|
|---|---|

Your agent's token. You can retrieve it in your Flex Plugin like this:

```javascript
import { Manager } from "@twilio/flex-ui";

const manager = Manager.getInstance();
const token = manager.user.token;
```

The token is a long character string that looks something like this:
`eyJ6aXAiOiJERUYiLCJraWQ...`

**allowedRoles**
|Type: `array`|Optional|
|---|---|

Checks if the agent's TaskRouter worker has **any** of the roles contained in the supplied array. By default, `flex-guard` will return a `403 - Forbidden` response unless `rejectRequest` is set to `false`.

Example:

```javascript
guard.allowed(token, ["supervisor", "admin"], callback);
```

**callback**
|Type: `function`|Optional|
|---|---|

For use inside a Twilio Function. If provided, `flex-guard` will automatically send a `401 - Unauthorized` response back using the parent function's `callback` method. If undefined, `flex-guard` will simply return `true | false`, giving you the ability to customize your response.
