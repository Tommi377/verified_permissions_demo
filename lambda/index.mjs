import { jwtDecode } from "jwt-decode";
import { VerifiedPermissions } from "@aws-sdk/client-verifiedpermissions";

const getPolicyStoreId = () => 'Qopi333ntJsmsk3xtCUAn'

export const handler = async (event) => {
    const policyStoreId = getPolicyStoreId();
    const identityToken = (event.headers?.Authorization || event.headers?.authorization).split(' ')[1];
    try {
        const identityTokenDecoded = jwtDecode(event.headers?.Authorization || event.headers?.authorization);

        if (!identityToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Identity token not found in the request headers.",
                }),
            };
        }

        const article = {
            id: "21341241",
            brand: "hs",
            permissionLevel: "free"
        }

        const contextMap = {
            brand: {
                string: "hs"
            },
            loggedIn: {
                boolean: true
            }
        }

        const verifiedpermissions = new VerifiedPermissions();

        const input = {
            identityToken,
            policyStoreId,
            action: { actionType: 'PaidArticle::Action', actionId: "ReadArticle" },
            resource: { entityType: 'PaidArticle::Article', entityId: article.id },
            entities: {
                entityList: [
                    {
                        "identifier": {
                            "entityType": "PaidArticle::Article",
                            "entityId": article.id
                        },
                        "attributes": {
                            "permissionLevel": {
                                "string": article.permissionLevel
                            },
                            "brand": {
                                "string": article.brand
                            }
                        },
                        "parents": []
                    }
                ]
            },
            context: {
                contextMap
            }
        };

        const authResponse = await verifiedpermissions.isAuthorizedWithToken(input);

        // Return the identity token in the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Identity token retrieved successfully.",
                resp: authResponse,
                identityTokenDecoded,
                input
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
                identityToken,
            }),
        };
    }
};
