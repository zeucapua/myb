import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  "login": async ({ request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle");
  }
};
