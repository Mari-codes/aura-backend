import { app } from "./app.js";
import { env } from "../shared/config/env.js";

app.listen(env.PORT, () => {
  console.log(`AURA API on http://localhost:${env.PORT}`);
});
