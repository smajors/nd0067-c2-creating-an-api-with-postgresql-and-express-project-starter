import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './models/handlers/UserHandler';
import productRoutes from './models/handlers/ProductHandler';
import orderRoutes from './models/handlers/OrderHandler';

const app: express.Application = express();
const address = '0.0.0.0:3000';

// CORS options
const corsOptions = {
  origin: 'http://127.0.0.1',
  optionsSuccessStatus: 200,
};

// Use CORS
app.use(cors(corsOptions));

// Define User Routes
userRoutes(app);
// Define product Routes
productRoutes(app);
// Define order Routes
orderRoutes(app);

app.use(bodyParser.json());

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});

export default app;
