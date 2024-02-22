import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from 'cors';

dotenv.config();

const {
  CLIENT_ID = '',
  CLIENT_SECRET= '',
  REDIRECT_URI= ''
} = process.env;
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/health", (req: Request, res: Response) => {
  res.send("Health");
});

app.get('/login', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (typeof code !== 'string') {
      throw new Error('No code provided')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code',
      })
    });
    const jsonData = await response.text();
    const data: { access_token: string, error?: string } = JSON.parse(jsonData);
    if (data.error) {
      throw new Error(data.error);
    }
    res.status(200).json({ accessToken: data.access_token });
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message }).end();
  }

});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
