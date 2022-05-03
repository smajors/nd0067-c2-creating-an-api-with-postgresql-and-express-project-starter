import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

/**
 * Verify user provided authentication token
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with verified data, or a 401 error
 */
const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        const tokenSecret = process.env.TOKEN_SECRET as unknown as Secret;
        if (token && tokenSecret) {
            const decoded = jwt.verify(token, tokenSecret);
            res.set('verifiedPayload', JSON.stringify(decoded));
        }
    } catch (err) {
        return res.status(401).json(err);
    }

    next();
}

export default verifyAuthToken;