import { NextResponse } from "next/server";
const admin = require("firebase-admin");
const serviceAccount = require("../../.././firebaseAdminServiceAccountKey.json");

export async function POST(request) {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const { uid } = await request.json();

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    return NextResponse.json(customToken);
  } catch (error) {
    return NextResponse.json(error);
  }
}
