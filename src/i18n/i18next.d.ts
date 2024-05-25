import type { ressources } from "./i18next";

declare module "i18next" {
    interface CustomTypeOptions {
        readonly ressource: typeof ressources["en"];
        readonly returnNull: false
    }
}
