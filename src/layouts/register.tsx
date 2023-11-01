import React, { useState } from "react";
import CreatePassKeyCredential from "utils/passkey/register/createPasskeyCredential";
import validatePassKeyCreation from "utils/passkey/register/validatePassKeyCreation";
import { Container, SignInButton, Copy, UserName } from "components/shared";
import { useDispatch } from "react-redux";
import { addUserAccount } from "redux-functionality/slices/userAccountsSlice";
import * as base64url from "../utils/passkey/shared/base64url-arraybuffer";
import generateRandomString from "utils/generators/randomString";
import { encode, decode } from "utils/passkey/shared/cbor";
import { parseAuthData } from "utils/passkey/shared/parseAuthData";

interface Props {
  onRegister: () => void;
  onReturnToSignIn: () => void;
}

// markup
const Register = ({ onRegister, onReturnToSignIn }: Props) => {
  const dispatch = useDispatch();
  const [login, setLogin] = useState(localStorage.getItem('login') || '');
  const [username, setUsername] = useState<string>("");
  // const [displayName, setDisplayName] = useState<string>("");

  const onUserNameChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(ev.target.value);
    setLogin(ev.target.value);
  };

  // const onDisplayNameChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
  //   setDisplayName(ev.target.value);
  // };

  const createPassKey = async () => {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // MARK: THIS SHOULD BE DONE ON THE BACKEND
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const userId = generateRandomString(16);
    console.log("✅  Created userId : ", userId);
    // rXfCD86r4OHTMk0j
    const challengeBufferString = generateRandomString(16);
    console.log("✅ Created challengeBufferString : ", challengeBufferString);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    /* MARK: THIS SHOULD BE DONE IF AN ACCOUNT IS VALID 
             AND THE CHALLENGE BUFFER AND USERID SHOULD BE PASSED
             FROM THE RETURN CALL IN THE SERVER
    */
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    try {
      const credential = await CreatePassKeyCredential(
        username.toLowerCase(),
        challengeBufferString,
        userId
      );
      console.log("✅ Created Pass Key Credential ! ");

      if (credential) {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // MARK: THIS SHOULD BE DONE ON THE BACKEND
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.log("✅ Credential is not null : ", credential);
        
        // @ts-ignore
        const attestationObject = decode(credential.response.attestationObject);
        console.log("🔥 ", attestationObject);
        console.log("attestationObject.authData: ", attestationObject.authData);
        const authData = parseAuthData(attestationObject.authData);
        console.log("authData: ", authData);
        console.log("public key x: ", authData.parsedCredentialPublicKey?.x);
        console.log("public key y: ", authData.parsedCredentialPublicKey?.y);

        // Validate PassKey Creation
        const challenge = validatePassKeyCreation(credential);
        switch (challenge) {
          case null:
            console.log("❌ PassKey verification failed.");
            return;
          default:
            console.log(
              "✅ PassKey verification passed with challenge : ",
              challenge
            );
            // Save the user account data.
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // MARK: THIS SHOULD BE SAVED TO YOUR BACKEND DATABASE
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            dispatch(
              addUserAccount({
                userId: userId,
                username: username,
                displayName: username,
                challengeBuffer: challengeBufferString,
                challenge: challenge,
              })
            );
            localStorage.setItem(`${login}_challengeBuffer`, challengeBufferString);
            localStorage.setItem(`${login}_challenge`, challenge);
            localStorage.setItem(`${login}_userId`, userId);
            onRegister();
            break;
        }
        // @ts-ignore
        localStorage.setItem(`${login}_passkeyId`, credential.id);
      } else {
        console.log("❌ Credential does not exist.");
      }
    } catch (error) {
      console.log("❌ Error creating credential");
      // Session Timed Out
      console.log("ERROR : ", error);
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
      {/* <UserName
        placeholder={"What should we call you?"}
        type={"text"}
        value={displayName}
        onChange={onDisplayNameChanged}
      /> */}
      <SignInButton onClick={createPassKey}> Register</SignInButton>
      <Copy>Already have an account ?</Copy>
      <SignInButton onClick={onReturnToSignIn}>Sign In</SignInButton>
    </Container>
  );
};

export default Register;
