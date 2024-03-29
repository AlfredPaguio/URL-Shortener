import {
  createShortUrl,
  disconnectFromDatabase,
  findShortUrl,
  getAllShortenedUrls,
} from "../services";
import type { Request, Response } from "express";
import addHTTPS from "../utils/AddHTTPS";

async function createShortUrlController(req: Request, res: Response) {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res.status(400).send({
      message: "The request cannot be fulfilled due to missing data.",
    });
  }
  try {
    const { shortUrl } = await createShortUrl({ originalUrl });
    return res
      .status(201)
      .send({ shortUrl: shortUrl, message: "Short URL created successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Error creating short URL" });
  }
}

async function getAllShortenedUrlsController(req: Request, res: Response) {
  try {
    const shortenedUrls = await getAllShortenedUrls();
    return res.status(200).json(shortenedUrls);
  } catch (error) {
    return res.status(500).send({ message: "Error fetching shortened URLs" });
  }
}

async function redirectShortUrlController(req: Request, res: Response) {
  const { shortUrl: findUrl } = req.params;
  if (!findUrl) {
    return res.status(404).send({
      message: "Short URL not found.",
    });
  }
  console.log("Find URL:", findUrl);
  try {
    const shortUrl = await findShortUrl(findUrl);
    console.log("Identity:", shortUrl?.whoami());
    if (!shortUrl) {
      await disconnectFromDatabase();
      return res.status(404).send({
        message: "Short URL not found.",
      });
    }
    shortUrl.clickCount++;
    const savedShortUrl = await shortUrl.save();
    const finalUrl = await addHTTPS(savedShortUrl.originalUrl);
    console.log("Redirecting to:", finalUrl);
    // res.redirect(302, "https://" + finalUrl);
    res.redirect(302, finalUrl);
  } catch (error) {
    // console.error("Error:", error);
    // res.status(500).send({ message: "Error fetching shortened URL" });
    res.status(500).send({ message: "Error: " + error });
  }
  await disconnectFromDatabase();
}

export {
  createShortUrlController,
  getAllShortenedUrlsController,
  redirectShortUrlController,
};
