import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { addLinkToDB, getLinkFromShortURL } from "./queries";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded());
app.use(express.json());

// root directory - form to make a link
app.get("/", (req: Request, res: Response) => {
  res.render("form");
});

// Accept POST from form to make a link
app.post("/makelink", async (req: Request, res: Response) => {
  // TODO: Check it's a valid URL.
  const inputURL = req.body.inputURL;

  const result = await addLinkToDB(inputURL);
  if (result.code != undefined) {
    res.render("error", result);
    return;
  }

  const protocol = req.protocol;
  const host = req.hostname;
  const port = process.env.PORT ? `:${process.env.PORT}` : ``;

  const fullUrl = `${protocol}://${host}${port}/${result.short}`;
  result.fullUrl = fullUrl;
  res.render("output", result);
});

// specific for error
app.get("/error", (req: Request, res: Response) => {
  res.render("error", { code: "Undefined error" });
});

// redirect
app.get("/:id", async (req: Request, res: Response) => {
  const fullURL = await getLinkFromShortURL(req.params.id);
  if (fullURL !== undefined) {
    const regexp = RegExp("(http|https)?://");
    const url = fullURL.fulllink.match(regexp)
      ? fullURL.fulllink
      : "http://" + fullURL.fulllink;
    res.redirect(url);
    return;
  }

  res.render("notexist");
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port} 🚀`);
});
