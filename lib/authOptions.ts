import { NextAuthOptions, Session } from "next-auth";
import { jwtDecode } from "jwt-decode";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { encrypt } from "@/lib/encryption";
import { JWT } from "next-auth/jwt";
// import clientPromise from "@/lib/MongodbClient";

export interface KeycloakSession extends Session {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
}

export interface KeycloakJWT extends JWT {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
}

async function refreshAccessToken(token: KeycloakJWT) {
  const searchParams = new URLSearchParams();
  searchParams.append(
    "client_id",
    process.env.KEYCLOAK_ID as string
  );
  searchParams.append(
    "client_secret",
    process.env.KEYCLOAK_SECRET as string
  );
  searchParams.append("grant_type", "refresh_token");
  searchParams.append("refresh_token", token.refresh_token!);
  const resp = await fetch(`${process.env.REFRESH_TOKEN_URL}`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // body: new URLSearchParams({
    //   client_id: process.env.DEMO_FRONTEND_CLIENT_ID as string,
    //   client_secret: process.env.DEMO_FRONTEND_CLIENT_SECRET as string,
    //   grant_type: "refresh_token",
    //   refresh_token: token.refresh_token,
    // }),
    body: searchParams,
    method: "POST",
  });
  const refreshToken = await resp.json();
  if (!resp.ok) throw refreshToken;


  console.log('new tok:',refreshToken)
  return {
    ...token,
    access_token: refreshToken.access_token,
    decoded: jwtDecode(refreshToken.access_token),
    id_token: refreshToken.id_token,
    expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in,
    refresh_token: refreshToken.refresh_token,
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: {},
    //     password: {},
    //   },
    //   async authorize(credentials, req) {
    //     const client = await clientPromise;
    //     const db = client.db() as any;

    //     const user = await db
    //       .collection("users")
    //       .findOne({ email: credentials?.email });

    //     const bcrypt = require("bcrypt");

    //     const passwordCorrect = await bcrypt.compare(
    //       credentials?.password,
    //       user?.password
    //     );

    //     if (passwordCorrect) {
    //       return {
    //         id: user?._id,
    //         email: user?.email,
    //       };
    //     }

    //     console.log("credentials", credentials);
    //     return null;
    //   },
    // }),
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID as string,
      clientSecret: process.env.KEYCLOAK_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    jwt: async ({ user, token, trigger, session, account, ...data }) => {
      // console.log("trigger", trigger);
      // console.log("data", token);
      console.log('jwt token:', token)
      const nowTimeStamp = Math.floor(Date.now() / 1000);
      if (account) {
        console.log("acc", account);
        token.decoded = jwtDecode(account.access_token || "");
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;
        return token;
      } else if (nowTimeStamp < (token.expires_at as number)) {
        return token;
      } else {
        console.log("Token has expired. will refresh...");
        try {
          const refreshedToken = await refreshAccessToken(token);
          console.log("Token is refreshed.");
          return refreshedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      // if (trigger === "update") {
      //   console.log('token updated' ,{ ...token, ...session.user })
      //   return { ...token, ...session.user };
      // }
      // console.log('token ' ,{ ...token, ...session.user })
      // return { ...token, ...user };
    },
    session: async ({
      session,
      token,
    }: {
      session: KeycloakSession;
      token: KeycloakJWT;
    }) => {
      console.log("session return:", session);
      console.log("token", token);
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.id_token = token.id_token;

      // console.log("keycloask sess: ", session);

      return session;
    },
  },
};
