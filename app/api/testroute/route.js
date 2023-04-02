import { NextResponse } from "next/server";

// export async function POST(req) {
//   const { msg } = req.body;
//   return new NextResponse(JSON.stringify({ messaggio: msg }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

export async function POST(request) {
  const { msg } = await request.json(); // res now contains body
  return NextResponse.json(msg);
}
