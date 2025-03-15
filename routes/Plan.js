import express from "express";
import Database from "../db/Connection.js";
import schemaValidator from "../db/Schema.js";
import etag from "etag";
import authentication from "../auth/index.js";

const planRouter = express.Router();
planRouter.use(authentication);

export class Plan {
  static KEY = "plan";

  static async getPlan(id) {
    const res = await Database.redisDb.HGET(Plan.KEY, id);

    if (!res) {
      throw new Error("NOT_FOUND");
    }
    return JSON.parse(res);
  }

  static async createPlan(plan) {
    if (!schemaValidator(plan)) {
      throw new Error("VALIDATION_FAILUIRE");
    }
    await Database.redisDb.HSET(Plan.KEY, plan.objectId, JSON.stringify(plan));
  }

  static async deletePlan(id) {
    const res = await Database.redisDb.HDEL(Plan.KEY, id);
    if (res == 0) {
      throw new Error("NOT_FOUND");
    }
  }

  static async updatePlan(plan) {
    await Database.redisDb.HSET(Plan.KEY, plan.objectId, JSON.stringify(plan));
  }
}

planRouter.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.getPlan(req.params.id);
    const generatedEtag = etag(JSON.stringify(plan), { weak: true });
    console.info("Etag : ", generatedEtag);
    res.setHeader("ETag", generatedEtag);
    if (
      !req.headers["if-none-match"] ||
      req.headers["if-none-match"] != generatedEtag
    ) {
      return res.status(200).send(plan);
    }
    return res.status(304).send();
  } catch (error) {
    if (error.message == "NOT_FOUND") return res.status(400).send();
    else {
      console.error("Error while respoinding to get plan", error);
      next(error);
    }
  }
});

planRouter.post("/", async (req, res, next) => {
  try {
    await Plan.createPlan(req.body);
    // return res.send(409);
  } catch (e) {
    if (e.message === "VALIDATION_FAILUIRE") return res.status(400).send();
    else return next(e);
  }
  res.set("Etag", etag(JSON.stringify(req.body), { weak: true }).toString());
  return res.status(201).send({
    message: "Plan created successfully",
    status_code: 201,
    objectId: req.body.objectId,
  });
});

planRouter.delete("/:id", async (req, res, next) => {
  try {
    await Plan.deletePlan(req.params.id);
  } catch (e) {
    if (e.message === "NOT_FOUND") return res.status(410).send();
    else return next(e);
  }
  return res.status(204).send();
});

// planRouter.patch("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     console.log("updateData", updateData);
//     // Validate if the plan exists
//     const existingPlan = await Plan.getPlan(id);
//     if (!existingPlan) {
//       return res
//         .status(404)
//         .send({ message: "Plan not found", status_code: 404 });
//     }

//     // Update the plan with provided fields only
//     await Plan.updatePlan(updateData);

//     // Fetch updated plan for ETag generation
//     const updatedPlan = await Plan.getPlan(id);
//     res.set(
//       "Etag",
//       etag(JSON.stringify(updatedPlan), { weak: true }).toString()
//     );

//     return res.status(200).send({
//       message: "Plan updated successfully",
//       status_code: 200,
//       objectId: id,
//     });
//   } catch (e) {
//     if (e.message === "VALIDATION_FAILURE") return res.status(400).send();
//     return next(e);
//   }
// });

planRouter.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const clientEtag = req.headers["if-match"]; // Get ETag from request

    // Fetch the current plan
    const existingPlan = await Plan.getPlan(id);
    if (!existingPlan) {
      return res
        .status(404)
        .send({ message: "Plan not found", status_code: 404 });
    }

    // Generate the current ETag
    const currentEtag = etag(JSON.stringify(existingPlan), {
      weak: true,
    }).toString();

    if (!clientEtag) {
      return res.status(400).send({
        message: "ETag required",
        status_code: 400,
      });
    }
    // Check if the client sent an ETag and if it matches
    if (clientEtag !== currentEtag) {
      return res.status(412).send({
        message: "Precondition Failed, No changes detected",
        status_code: 412,
      });
    }
    console.log("updateData", updateData.linkedPlanServices);
    // Filter out only the fields that have changed
    const appendedFields = [];
    const existingLinkedinPlanServices = [];
    existingPlan.linkedPlanServices.forEach((element) =>
      existingLinkedinPlanServices.push(element.objectId)
    );

    updateData.linkedPlanServices.forEach((element) => {
      if (!existingLinkedinPlanServices.includes(element.objectId)) {
        appendedFields.push(element);
        existingPlan.linkedPlanServices.push(element);
      } else {
        existingPlan.linkedPlanServices.forEach((existingElement, index) => {
          if (existingElement.objectId === element.objectId) {
            // the object int he existing plan should be updated
            existingPlan.linkedPlanServices[index] = element;
          }
        });
      }
    });

    await Plan.updatePlan(existingPlan);

    const updatedPlan = await Plan.getPlan(id);
    const newEtag = etag(JSON.stringify(updatedPlan), {
      weak: true,
    }).toString();
    res.set("Etag", newEtag);
    return res.status(200).send({
      message: "Plan updated successfully",
      status_code: 200,
      objectId: id,
    });
  } catch (e) {
    if (e.message === "VALIDATION_FAILURE") return res.status(400).send();
    return next(e);
  }
});

planRouter.all("*", async (req, res) => {
  return res.status(405).send();
});

// module.exports = Plan;
// module.exports = planRouter;
// module.exports = planRouter;
export default planRouter;
