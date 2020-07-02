# Flex Guard

Flex Guard provides a simple API for handling authorization of requests between an agent and Twilio Functions (or your own Node.js app). Flex Guard checks for a valid agent token, and can also check if the agent certain required roles.

Flex Guard returns `true` if the request is allowed and `false` if it is not. It will also optionally return automatically return a `401 - Unauthorized` response.

## Use Cases

-   You want to allow a contact center agent to click a button that sends an email to the customer. Flex guard will check to see if the user initiating the API call to send the email has a valid token.

-   When an agent's task loads, you want to pull data from a customer data platform. Flex Guard will check to see that they have a valid token before returning a response to the API call.

-   You want to allow certain agents to perform sensitive tasks like update PII. Flex Guard will check if they have the required role.

### Back-End

Twilio function:

```javascript
let Guard = require("flex-guard");

exports.handler = async function (context, event, callback) {
    const guard = new Guard(context, event, callback);
    const allowed = await guard.allowed();
    // => true || false
};
```

Node.js / Express app:

```javascript
let Guard = require("flex-guard");
// Other dependencies...

router.post('/flex-request', jsonParser, function (req, res) {
    context = {
        ACCOUNT_SID: process.env.ACCOUNT_SID,
        AUTH_TOKEN: process.env.AUTH_TOKEN
    }

    // Must include token property
    event = req.body;

    const guard = new Guard(context, event, callback);
    const allowed = await guard.allowed();
    // => true || false
})

```

### Front-End

In your Flex Plugin, you'll need to include your agent's token with the key `token` in the body of your request:

1. Import `Manager` from `@twilio/flex-ui`
1. Use `Manager` to get the agent's token
1. Include `token` in the body of your request

Example:

```javascript
// Import Manager
import { Manager } from "@twilio/flex-ui";

export default class MyComponent extends React.Component {
    componentDidMount() {
        // Get the agent's token from Manager
        const manager = Manager.getInstance();
        const token = manager.user.token;

        fetch(`https://my-env-123.twil.io/my-function`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            // Include the token in the body of your request
            body: `token=${token}&myCustomKey=${myCustomData}`,
        }).then((response) => {
            // Handle the response
        });
    }

    // Render your component, etc.
}
```

## Reference

### Guard()

#### Arguments

`allow` takes the same first three arguments that are passed to a Twilio function, plus an options object. While `flex-guard` is built primarily with Twilio functions in mind, you can also use it with your own Node.js app by including the required arguments when you initialize `Guard`.

**context**
|Type: `object`|Required|
|---|---|

The `context` object should contain your Account SID and Auth Token. If you are using Twilio Functions, simply check "Enable ACCOUNT_SID and AUTH_TOKEN" on the [Twilio Functions Configuration page]("https://www.twilio.com/console/functions/configure") and pass your function's `context` argument to `flex-guard`

If you are using your own Node.js app, include your credentials in a context object like this:

```json
{
    "ACCOUNT_SID": "ACXXXXXXXXXXXXXXXXXXXXXXXXX",
    "AUTH_TOKEN": "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**event**
|Type: `object`|Required|
|---|---|

The `event` object should have a property called `token` with the agent's token as the value. If you are using Twilio Functions, this object will include all parameters passed to your function as well. Example event object:

```json
{
    "token": "eyJ6aXAiOiJERUYiLCJraWQ..."
}
```

**callback**
|Type: `function`|Optional|
|---|---|

For use inside a Twilio Function. If provided, `flex-guard` will automatically send a `401 - Unauthorized` response back using the parent function's `callback` method. If set to null, `flex-guard` will simply return `true | false`, giving you the ability to customize your response.

**allowedRoles**
|Type: `array`|Optional|
|---|---|

Checks if the agent (TaskRouter worker) has any of the roles contained in the supplied array. By default, `flex-guard` will return a `403 - Forbidden` response unless `rejectRequest` is set to `false`.

Example:

```javascript
guard(context, event, callback, ["supervisor", "admin"]);
```
