import { jwtDecode } from "jwt-decode";
import { VerifiedPermissionsClient, IsAuthorizedCommand } from "@aws-sdk/client-verifiedpermissions";

export const handler = async (event) => {
    try {
        const identityToken = jwtDecode(event.headers?.Authorization || event.headers?.authorization);

        if (!identityToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Identity token not found in the request headers.",
                }),
            };
        }

        const article = {
            id: 21341241,
            permission: "HSDigi"
        }

        // identityToken['custom:roles'].map(s => ({ "string": s }))

        const client = new VerifiedPermissionsClient();
        const authCommand = new IsAuthorizedCommand({
            policyStoreId: "6aaosSkLzqopTLFvaFbcsJ",
            principal: {
                "entityType": "PaidArticles::User",
                "entityId": identityToken.nickname
            },
            action: {
                "actionType": "PaidArticles::Action",
                "actionId": "ReadArticle"
            },
            resource: {
                "entityType": "PaidArticles::Article",
                "entityId": article.id
            },
            // entities: {
            //     entityList: [
            //         {
            //             "identifier": {
            //                 "entityType": "PaidArticles::User",
            //                 "entityId": identityToken.nickname
            //             },
            //             "attributes": {
            //                 "subscriptions": {
            //                     set: []
            //                 }
            //             }
            //         },
            //         {
            //             "identifier": {
            //                 "entityType": "PaidArticles::Article",
            //                 "entityId": article.id
            //             },
            //             "attributes": {
            //                 "subscriptionLevel": {
            //                     set: article.permission
            //                 }
            //             }
            //         }
            //     ]
            // }
        });

        const resp = await client.send(authCommand);

        // Return the identity token in the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Identity token retrieved successfully.",
                identityToken,
                resp
            }),
        };
    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "An error occurred while processing the request.",
                error: error.message,
                dump: JSON.stringify(error),
            }),
        };
    }
};
