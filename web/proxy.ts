import {NextRequest, NextResponse} from "next/server";
import {SignJWT, jwtVerify} from "jose";
import {v4 as uuidv4} from "uuid";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    const response = NextResponse.next();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (!session) {
        const sessionId = uuidv4();

        const newSession = await new SignJWT({sessionId, expiresAt})
            .setProtectedHeader({alg: "HS256"})
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(encodedKey);

        response.cookies.set("session", newSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiresAt,
            sameSite: "lax",
            path: "/",
        });

        return response;
    }

    try {
        await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });

        // Refresh the session expiration
        response.cookies.set("session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiresAt,
            sameSite: "lax",
            path: "/",
        });
    } catch (error) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionId = uuidv4();

        const newSession = await new SignJWT({sessionId, expiresAt})
            .setProtectedHeader({alg: "HS256"})
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(encodedKey);

        response.cookies.set("session", newSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiresAt,
            sameSite: "lax",
            path: "/",
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
};
