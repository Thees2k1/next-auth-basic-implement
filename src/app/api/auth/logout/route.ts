import { getServerSession } from "next-auth";
import { authOptions, KeycloakSession } from "../../../../../lib/authOptions";
import { NextResponse } from "next/server";

export async function GET() {
  const session : KeycloakSession |null = await getServerSession(authOptions);
  if (session) {
    const idToken = session.id_token;
    // var url = `${
    //   process.env.END_SESSION_URL
    // }?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
    //   process.env.NEXTAUTH_URL as string
    // )}`;

    let url = `${process.env.NEXTAUTH_ISSUER}/protocol/openid-connect/logout? 
                post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL as string)}`
    console.log('logout url', url)

    if(session){

    }
    if(idToken) {
      url = url + `&id_token_hint=${session.id_token}`
    } else {
      url = url + `&client_id=${process.env.KEYCLOAK_ID}`
    }

    const res = new Response()
    try {
      const resp = await fetch(url, { method: "GET" });
    } catch (err) {
      console.error(err);
      return NextResponse.json({error: err},{status: 500});
    }
  }

  return NextResponse.json({session},{status: 200});
}
