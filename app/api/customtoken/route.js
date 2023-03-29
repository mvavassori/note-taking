import { NextResponse } from "next/server";
const admin = require("firebase-admin");
const serviceAccount = require("../../.././firebaseAdminServiceAccountKey.json");

export async function POST(request) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const { uid } = request.body;

  admin
    .auth()
    .createCustomToken(uid)
    .then((customToken) => {
      console.log("Custom token:", customToken); // check
      return NextResponse(JSON.stringify({ customToken }), {
        headers: { "Content-Type": "application/json" },
      });
    })
    .catch((error) => {
      console.error("Error creating custom token:", error);
      return NextResponse(
        JSON.stringify({ error: "Unable to create custom token" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    });
}

//! CUT

// export async function POST(request) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });

//   const { uid } = request.body;

//   admin
//     .auth()
//     .createCustomToken(uid)
//     .then((customToken) => {
//       return new Response(JSON.stringify({ customToken }), {
//         headers: { "Content-Type": "application/json" },
//       });
//     })
//     .catch((error) => {
//       console.error("Error creating custom token:", error);
//       return new Response(
//         JSON.stringify({ error: "Unable to create custom token" }),
//         {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     });
// }

//! CUT

// export async function POST(request) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });

//   // uid is the unique user ID of the authenticated user
//   // const uid = "user-123";
//   request.body.uid = uid;

//   admin
//     .auth()
//     .createCustomToken(uid)
//     .then((customToken) => {
//       // Send the custom token back to the client
//       // res.json({ customToken });
//       new Response.json(customToken);
//     })
//     .catch((error) => {
//       console.error("Error creating custom token:", error);
//       // res.status(500).json({ error: "Unable to create custom token" });
//     });
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// // uid is the unique user ID of the authenticated user
// const uid = "user-123";

// admin
//   .auth()
//   .createCustomToken(uid)
//   .then((customToken) => {
//     // Send the custom token back to the client
//     res.json({ customToken });
//   })
//   .catch((error) => {
//     console.error("Error creating custom token:", error);
//     res.status(500).json({ error: "Unable to create custom token" });
//   });
