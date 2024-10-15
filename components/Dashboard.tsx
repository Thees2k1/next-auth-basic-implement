"use client";

import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { KeycloakSession } from "../lib/authOptions";


async function keycloakSessionLogOut(){
  try{
    await fetch(`/api/auth/logout`,{method:"GET"})
  }catch (e){
    console.error("err: ",e);
  }
}
const Dashboard = () => {
  const { data ,status} = useSession();
  
  const session : KeycloakSession|null= data

  console.log('client data:',session)



  if(status === "loading"){
   return  <div className="">Loading....</div>
  }

  return (
    <>
      {session ? (
        <>
          <img
            src={session.user?.image as string}
            className="rounded-full h-20 w-20"
          ></img>
          <h1 className="text-3xl text-green-500 font-bold">
            Welcome back, {session.user?.name}
          </h1>
          <p className="text-2xl font-semibold">{session.user?.email}</p>
          <p className="text-2xl font-semibold">{session.id_token}</p>
          <button
            onClick={() => {
              keycloakSessionLogOut().then(()=> signOut({ }))
            }}
            // onClick={() => signOut({callbackUrl:"/"})}
            className="border border-black rounded-lg bg-red-400 px-5 py-1"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl text-red-500 font-bold">
            You're not logged in
          </h1>
          <div className="flex space-x-5">
            <button
              onClick={() => signIn("google")}
              className="border border-black rounded-lg px-5 py-1"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => signIn("github")}
              className="border border-black rounded-lg bg-green-500 px-5 py-1"
            >
              Sign in with GitHub
            </button>
            <button
              onClick={() => signIn("keycloak")}
              className="border border-black rounded-lg bg-blue-500 px-5 py-1"
            >
              Sign in with Keycloak
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
