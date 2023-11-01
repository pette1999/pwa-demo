import React, { useState } from "react";
import { Container, SignInButton, Copy, UserName } from "components/shared";
import getPasskeyCredential from "utils/passkey/authenticate/getPasskeyCredential";
import parseClientData from "utils/passkey/shared/parseClientData";
import UserAccount from "types/passkey/userAccount";
import verifyUserId from "utils/passkey/authenticate/verifyUserId";
import verifyClientData from "utils/passkey/authenticate/verifyClientData";
import store, { RootState } from "redux-functionality/index";
import { useSelector } from "react-redux";
import * as base64url from "../utils/passkey/shared/base64url-arraybuffer";
import { authResponseToSigVerificationInput } from "utils/passkey/shared/authResponseToSigVerificationInput";

interface Props {
  onRegister: () => void;
  onSignIn: () => void;
}

// markup
const Landing = ({ onRegister, onSignIn }: Props) => {
  const [username, setUsername] = useState<string>("");
  
  const userAccounts: Array<UserAccount> = useSelector(
    (state: RootState) => state.userAccounts.accounts
  );

  const onUserNameChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(ev.target.value);
  };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // MARK: THIS SHOULD BE DONE ON THE BACKEND
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  /*
      This functionality gathers the user account requested,
      this should be gathered via an API call to the backend.
  */

  const getUserAccount = () => {
    if (userAccounts === undefined) {
      return null;
    }

    const match = userAccounts.filter(
      (item) => item.username.toLowerCase() === username.toLowerCase()
    );

    if (match.length > 0) {
      return match[0];
    } else {
      return null;
    }
  };

  const performLogin = async (challenge: string, username: string) => {
    console.log("⚈ ⚈ ⚈ performLogin ⚈ ⚈ ⚈");
    try {
      const credential = await getPasskeyCredential(challenge, username);
      console.log(" performLogin ✅ credential : ", credential);
      return credential;
    } catch (error) {
      console.log(
        "performLogin ❌  Failed to get credential with error : ",
        error
      );
      return null;
    }
  };

  const signIn = async () => {
    console.log("⚈ ⚈ ⚈ signIn ⚈ ⚈ ⚈");
    // Get the account related to the username.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // MARK: THIS SHOULD BE DONE ON THE BACKEND
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // const userAccount = getUserAccount();
    const loginPasskeyId = localStorage.getItem(`${username}_passkeyId`);
    const loginChallengeBuffer = localStorage.getItem(`${username}_challengeBuffer`)
    const loginUserId = localStorage.getItem(`${username}_userId`)
    const loginChallenge = localStorage.getItem(`${username}_challenge`)
    console.log("⚈ ⚈ ⚈ getUserAccount ⚈ ⚈ ⚈");
    if (loginPasskeyId !== null && loginChallengeBuffer != null && loginUserId !== null && loginChallenge !== null) {
      // console.log(
      //   "Get User Account ✅ There is a match for that username : ",
      //   userAccount
      // );
      // Login with the details.
      // This part remains on the front-end in production.
      const credential = await performLogin(loginChallengeBuffer, username);
      if (credential === null) {
        // alert('Failed to get credential')
        return Promise.reject(new Error("Failed to get credential"));
      }
      
      if (credential !== null) {
        console.log("credential: ", credential);
        //@ts-ignore
        const response = credential.response;
        const signatureResponse = {
          clientDataJSON: base64url.encode(response.clientDataJSON),
          authenticatorData: base64url.encode(response.authenticatorData),
          signature: base64url.encode(response.signature),
          userHandle: base64url.encode(response.userHandle),
        }
        const ecVerifyInputs = authResponseToSigVerificationInput({}, signatureResponse);
        console.log('verify inputs', ecVerifyInputs);
        console.log("R: ", ecVerifyInputs.signature[0]);
        console.log("S: ", ecVerifyInputs.signature[1]);

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // MARK: THIS SHOULD BE DONE ON THE BACKEND
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        /*
          This functionality confirms that theres a credentials are valid
          and that they match the details related to the users account.
        */
        switch (verifyUserId(credential, loginUserId)) {
          case true:
            switch (verifyClientData(credential, loginChallenge)) {
              case true:
                console.log("✅ You have succesfully logged in.");
                onSignIn();
                break;
              case false:
                console.log("❌ The challenge does not match.");
                break;
            }
            break;
          case false:
            break;
        }
      } else {
        console.log(
          " signIn ❌ Failed to perform Login as credential does not exist."
        );
      }
    } else {
      console.log(" signIn ❌ There is no match for that username.");
    }
  };

  return (
    <Container>
      <UserName
        placeholder={"Please enter your email"}
        type={"text"}
        autoComplete={"username webauthn"}
        value={username}
        onChange={onUserNameChanged}
      />
      <SignInButton onClick={signIn}> Sign In</SignInButton>
      <Copy>Not Created an Account ?</Copy>
      <SignInButton onClick={onRegister}>Register</SignInButton>
    </Container>
  );
};

export default Landing;
