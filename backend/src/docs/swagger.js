import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "node:fs";

const openapiPath = new URL("./openapi.yml", import.meta.url);
const openapiDocument = YAML.parse(fs.readFileSync(openapiPath, "utf8"));

export const configurarSwagger = (app) => {
  app.get("/openapi.json", (req, res) => {
    res.status(200).json(openapiDocument);
  });

  app.get("/openapi.yml", (req, res) => {
    res.type("text/yaml").send(YAML.stringify(openapiDocument));
  });

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, {
      explorer: true,
      customSiteTitle: "Users API - Swagger",
    }),
  );
};
