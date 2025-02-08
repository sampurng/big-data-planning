import express from "express";
import Database from "../db/Connection.js";
import schemaValidator from "../db/Schema.js";
import etag from "etag";

const planRouter = express.Router();

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
    if (error.message == "NOT_FOUND") return res.status(410).send();
    else {
      console.error("Error while respoinding to get plan", error);
      next(error);
    }
  }
});

planRouter.post("/", async (req, res, next) => {
  try {
    await Plan.createPlan(req.body);
  } catch (e) {
    return next(e);
  }
  res.set("Etag", etag(JSON.stringify(req.body), { weak: true }).toString());
  return res.status(201).send({
    message: "Plan created successfully",
    status_code: 201,
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

planRouter.all("*", async (req, res) => {
  return res.status(405).send();
});

// module.exports = Plan;
// module.exports = planRouter;
// module.exports = planRouter;
export default planRouter;
