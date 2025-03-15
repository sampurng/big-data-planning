import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const authentication = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }
  //   console.log("token", token);
  const decodedToken = jwt.decode(token, { complete: true });
  //   console.log("decodedToken", decodedToken);
  if (!decodedToken) {
    return res.status(401).send({ error: "Invalid token" });
  }

  const client = new OAuth2Client(process.env.CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  if (!ticket) {
    return res.status(401).send({ error: "Invalid token" });
  }
  if (
    ticket.getPayload().iss == decodedToken.payload.iss &&
    ticket.getPayload().aud == decodedToken.payload.aud
  ) {
    req.user = ticket;
    next();
  } else {
    return res.status(401).send({ error: "Invalid token" });
  }
};

export default authentication;
