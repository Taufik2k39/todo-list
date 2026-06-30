import { NextRequest } from "next/server";

import { editProfileController, userProfileController } from "@/controllers/auth-controller";

export async function GET(request: NextRequest) {
  return userProfileController(request);
}

export async function PATCH(request: NextRequest) {
  return editProfileController(request);
}
