import { jwtDecode } from "jwt-decode";
import { VerifiedPermissions } from "@aws-sdk/client-verifiedpermissions";

const getPolicyStoreId = () => 'RmQMwSaavEdyem4d5u3cam'

export const handler = async (event) => {
    const policyStoreId = getPolicyStoreId();
    const identityToken = (event.headers?.Authorization || event.headers?.authorization).split(' ')[1];

    const pathValues = event.path.split('/').filter(s => s.length > 0);
    if (pathValues.length < 2) {
      throw new PathIncorrectError(
        `Incorrect path parameters: ${pathValues.join('')}`,
      );
    }
  
    const productId = pathValues[pathValues.length - 2];
    const articleId = pathValues[pathValues.length - 1];

    try {
        jwtDecode(event.headers?.Authorization || event.headers?.authorization);

        if (!identityToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Identity token not found in the request headers.",
                }),
            };
        }

        const articles = {
            articleFree: {
                id: "21341241",
                brand: "hs",
                permissionLevel: "free"
            },
            articlePaid: {
                id: "21341242",
                brand: "hs",
                permissionLevel: "paid"
            },
            articlePaidIS: {
                id: "21341243",
                brand: "is",
                permissionLevel: "paid"
            }
        };

        const article = articles[articleId];

        const contextMap = {
            brand: {
                string: productId
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
                message: "Evaluation: " + authResponse.decision,
                resp: authResponse,
            }),
        };
    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "An error occurred while processing the request.",
                error: error.message,
            }),
        };
    }
};
