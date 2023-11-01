import * as base64url from "../shared/base64url-arraybuffer";

const getPasskeyCredential = async (challenge: string, username: string) => {
  let passkeyIdBuffer;
  const loginPasskeyId = localStorage.getItem(`${username}_passkeyId`);
  if (loginPasskeyId) {
    passkeyIdBuffer = base64url.decode(loginPasskeyId)
  } else {
    passkeyIdBuffer = base64url.decode("")
  }
  console.log("loginPasskeyId: ", loginPasskeyId);
  console.log("passkeyIdBuffer: ", passkeyIdBuffer);
  const challengeBuffer = Uint8Array.from(challenge, (c) => c.charCodeAt(0));
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: challengeBuffer,
    // rpId: process.env.REACT_APP_RP_DOMAIN,
    allowCredentials: [
      {
        id: passkeyIdBuffer,
        type: "public-key",
      },
    ],
    userVerification: "required",
    timeout: 60000,
  };

  return await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });
};

export default getPasskeyCredential;
