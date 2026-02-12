import { User } from "../models/User";
import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { clerkClient, getAuth } from "@clerk/express";

/**
 * Retrieve the authenticated user's record and send it in the response.
 *
 * Sends a 200 response with the user object when found, a 404 response with
 * `{ message: "User not found" }` when no user exists for `req.userId`, and
 * forwards unexpected errors to the next error handler.
 *
 * @param req - Auth request containing `userId` of the authenticated user
 * @param res - Response used to send JSON status responses
 * @param next - Next function used to forward errors to error-handling middleware
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user);

    } catch (error) {
        // res.status(500).json({ message: "Internal server error" })
        next(error);
    }
}

/**
 * Ensure an authenticated Clerk user has a corresponding local User and return that user as JSON.
 *
 * If the request is not authenticated with Clerk, responds with 401. If a local User record does not exist,
 * creates one from the Clerk profile. On success, responds with an object containing the user: `{ user }`.
 * Any unexpected errors are forwarded to the next error-handling middleware.
 *
 * @param req - Express request, expected to carry Clerk authentication info (used via `getAuth(req)`)
 * @param res - Express response used to send JSON responses
 * @param next - Express next function; invoked with an error on failure
 */
export async function authCallback(req: Request, res: Response, next:NextFunction) {
    try {
        const { userId: clerkId } = getAuth(req);

        if (!clerkId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let user = await User.findOne({ clerkId })

        if (!user) {
            // get user info from clerk and save to db
            const clerkUser = await clerkClient.users.getUser(clerkId);

            user = await User.create({
                clerkId,
                name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
                    : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
                email: clerkUser.emailAddresses[0]?.emailAddress,
                avatar: clerkUser.imageUrl,
            });
        }

        res.json({user});

    } catch (error) {
        // res.status(500).json({message: "Internal server error"})
        next(error);
    }
}