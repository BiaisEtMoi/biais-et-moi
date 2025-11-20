import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { getIdentityFromStorage } from "../identity/identity.storage";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  if (browser) {
    const identity = getIdentityFromStorage();

    if (!identity?.valid) {
      throw redirect(303, "/identity");
    }
  }

  return {};
};
