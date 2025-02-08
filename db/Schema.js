import Ajv from "ajv";

const healthSchema = {
  type: "object",
  properties: {
    planCostShares: {
      type: "object",
      properties: {
        deductible: { type: "integer" },
        _org: { type: "string" },
        copay: { type: "integer" },
        objectId: { type: "string" },
        objectType: { type: "string", enum: ["membercostshare"] },
      },
      required: ["deductible", "_org", "copay", "objectId", "objectType"],
    },
    linkedPlanServices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          linkedService: {
            type: "object",
            properties: {
              _org: { type: "string" },
              objectId: { type: "string" },
              objectType: { type: "string", enum: ["service"] },
              name: { type: "string" },
            },
            required: ["_org", "objectId", "objectType", "name"],
          },
          planserviceCostShares: {
            type: "object",
            properties: {
              deductible: { type: "integer" },
              _org: { type: "string" },
              copay: { type: "integer" },
              objectId: { type: "string" },
              objectType: { type: "string", enum: ["membercostshare"] },
            },
            required: ["deductible", "_org", "copay", "objectId", "objectType"],
          },
          _org: { type: "string" },
          objectId: { type: "string" },
          objectType: { type: "string", enum: ["planservice"] },
        },
        required: [
          "linkedService",
          "planserviceCostShares",
          "_org",
          "objectId",
          "objectType",
        ],
      },
    },
    _org: { type: "string" },
    objectId: { type: "string" },
    objectType: { type: "string", enum: ["plan"] },
    planType: { type: "string" },
    creationDate: {
      type: "string",
      pattern: "^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(\\d{4})$",
    },
  },
  required: [
    "planCostShares",
    "linkedPlanServices",
    "_org",
    "objectId",
    "objectType",
    "planType",
    "creationDate",
  ],
};

const ajv = new Ajv();
const schemaValidator = ajv.compile(healthSchema);

// module.exports = schemaValidator;
export default schemaValidator;
