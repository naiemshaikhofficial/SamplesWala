import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "samples_wala_mumbai_secret_v1";

export async function signDownloadToken(payload: any) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Valid for 15 mins
    .sign(secret);
}

export async function verifyDownloadToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}
