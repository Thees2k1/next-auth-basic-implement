import { getServerSession } from "next-auth";
import { authOptions, KeycloakSession } from "../../lib/authOptions";
import { decrypt } from "./encryption";


export async function getAccessToken(){
    const session : KeycloakSession |null| undefined = await getServerSession(authOptions);

    if(session){
        console.log('server sess', session)
        const accessTokenDecrypted = session.access_token;
        return accessTokenDecrypted;
    }
    return null;
}

export async function getIdToken(){
    const session : KeycloakSession |null| undefined = await getServerSession(authOptions);

    if(session){
        const idTokenDecrypted = session.id_token
        return idTokenDecrypted;
    }
    return null
}