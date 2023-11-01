import React from "react";
import UserAccount from "types/passkey/userAccount";
import validatePassKey from "./validatePassKey";
import parseClientData from "../shared/parseClientData";

const verifyClientData = (
  credential: Credential,
  loginChallenge: string
): boolean => {
  //@ts-ignore
  let clientData = parseClientData(credential.response.clientDataJSON);
  if (clientData !== null) {
    console.log("✅ We have performed the login.");
    console.log("✅ clientData : ", clientData);
    console.log("⚈ ⚈ ⚈ Verifying Challenge ⚈ ⚈ ⚈");
    return validatePassKey(loginChallenge, clientData.challenge);
  } else {
    console.log("❌ Failed to perform Login. Client data json is null.");
    return false;
  }
};

export default verifyClientData;
