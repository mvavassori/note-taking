import { NextResponse } from "next/server";

export async function POST(request) {
  const { msg } = await request.json(); // res now contains body
  return NextResponse.json(msg);
}
