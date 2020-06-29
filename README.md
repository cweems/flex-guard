# Flex Guard

Make secure requests to Twilio Functions from Flex by validating agent tokens.

## What it Does

If your Twilio Flex contact center interface needs to make HTTP requests to a back-end, you'll likely want to check if the request is authorized.

Flex Guard validates your Flex agent's access token before running your Twilio function or self-hosted code. If the agent is unauthorized, it will return a `401 - Unauthorized` response.

## Usage

To use Flex Guard, you'll need to make changes to your back-end controller (e.g Twilio Function) as well as your Flex Plugin.

### Back-End

```javascript
let guard = require("flex-guard");

exports.handler = async function (context, event, callback) {
    await guard(context, event, callback);

    // your protected code here...
};
```

### Front-End

In your Flex Plugin, you'll need to include your agent's token with the key `token` in the body of your request. You'll need to follow 3 basic steps:

1. Import `Manager` from `@twilio/flex-ui`
1. Use `Manager` to get the agent's token
1. Include `token` in the body of your request

The following example shows loading data when the component mounts might look like:

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
