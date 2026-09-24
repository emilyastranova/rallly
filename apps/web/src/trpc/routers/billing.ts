import * as z from "zod";
import { router, spaceOwnerProcedure } from "../trpc";

export const billing = router({
  updateSeats: spaceOwnerProcedure
    .input(z.object({ seatDelta: z.int() }))
    .mutation(async () => {
      return { url: "" };
    }),
});
