import * as cdk from 'aws-cdk-lib';
import { IdentitySource, Policy, PolicyStore, ValidationSettingsMode } from '@cdklabs/cdk-verified-permissions';
import { Construct } from 'constructs';

export class AVPCdkStack extends cdk.Stack {
    readonly policyStore: PolicyStore;
    readonly subscriptionPolicies = [
        { name: "HSMINI", brand: "hs", permissions: ["paid", "paidNoIndicator", "archived", "archivedPaid"] },
        { name: "HSDIGI", brand: "hs", permissions: ["paid", "paidNoIndicator", "archived", "archivedPaid", "edition"] }
    ]

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const validationSettingsStrict = {
            mode: ValidationSettingsMode.STRICT,
        };
        const cedarJsonSchema = this.getSchema();
        const cedarSchema = {
            cedarJson: JSON.stringify(cedarJsonSchema),
        };
        this.policyStore = new PolicyStore(this, "PaidArticlesPolicyStore", {
            schema: cedarSchema,
            validationSettings: validationSettingsStrict,
            description: "Paid Articles API Policy Store"
        });
        new IdentitySource(this, "IdentitySource", {
            configuration: {
                openIdConnectConfiguration: {
                    issuer: "https://dev-7qmquhjbn7s4cklo.us.auth0.com/",
                    identityTokenOnly: {
                        clientIds: [],
                        principalIdClaim: "sub"
                    }

                },
            },
            principalEntityType: "PaidArticle::User",
            policyStore: this.policyStore
        });

        this.createDefaultPolicies();
        this.subscriptionPolicies.forEach(sub => {
            this.createSubscriptionPolicy(sub.name, sub.brand, sub.permissions);
        });
    }

    private createDefaultPolicies = () => {
        new Policy(this, "AuthenticatePolicy", {
            definition: {
                static: {
                    statement: `forbid (principal,action in [PaidArticle::Action::"ReadArticle"],resource) when {
                                !["free", "metered"].contains(resource.permissionLevel) && !context.loggedIn};`,
                    description: "ALL: Forbid if unauthenticated for non-free articles",
                },
            },
            policyStore: this.policyStore,
        });
        new Policy(this, "FreeArticlePolicy", {
            definition: {
                static: {
                    statement: `permit (principal, action in [PaidArticle::Action::"ReadArticle"], resource) when {
                                ["free", "metered", "authenticated"].contains(resource.permissionLevel)};`,
                    description: "ALL: Permit if article is free",
                },
            },
            policyStore: this.policyStore,
        });
        new Policy(this, "BrandPolicy", {
            definition: {
                static: {
                    statement: `forbid (principal, action, resource) when { context.brand != resource.brand };`,
                    description: "ALL: Forbid if accessing other brands articles",
                },
            },
            policyStore: this.policyStore,
        });
    }

    private createSubscriptionPolicy = (name: string, brand: string, permissions: string[]) => {
        new Policy(this, `${name}Policy`, {
            definition: {
                static: {
                    statement: `permit (principal, action in [PaidArticle::Action::"ReadArticle"], resource) when
                                { resource.brand == "${brand}" && principal.subscriptions.contains("${name}") &&
                                ${JSON.stringify(permissions)}.contains(resource.permissionLevel)};`,
                    description: `${brand}: ${name}`,
                },
            },
            policyStore: this.policyStore,
        });
    }

    private getSchema = () => ({
        PaidArticle: {
            entityTypes: {
                User: {
                    memberOfTypes: [],
                    shape: {
                        type: "Record",
                        attributes: {
                            subscriptions: {
                                required: true,
                                type: "Set",
                                element: {
                                    type: "String"
                                }
                            }
                        }
                    }
                },
                Article: {
                    memberOfTypes: [],
                    shape: {
                        type: "Record",
                        attributes: {
                            permissionLevel: {
                                type: "String",
                                required: true
                            },
                            brand: {
                                type: "String",
                                required: true
                            }
                        }
                    }
                }
            },
            actions: {
                ReadArticle: {
                    memberOf: [],
                    appliesTo: {
                        context: {
                            type: "Environment"
                        },
                        principalTypes: [
                            "User"
                        ],
                        resourceTypes: [
                            "Article"
                        ]
                    }
                }
            },
            commonTypes: {
                Environment: {
                    type: "Record",
                    attributes: {
                        brand: {
                            type: "String",
                            required: true
                        },
                        loggedIn: {
                            type: "Boolean",
                            required: true
                        }
                    }
                }
            }
        }
    })
}
