/**
 * Schemas to validate JSON requests to instances POST and PUT endpoints.
 */

// POST SCHEMA
var DatasetSchema = {
    type: "object",
    properties: {
        description: {
            id: "/properties/description",
            type: "string"
        },
        name: {
            id: "/properties/name",
            type: "string"
        },
        url: {
            id: "/properties/url",
            type: "string"
        }
    },
    required: ['name']
};

module.exports = { DatasetSchema: DatasetSchema};
