import { z } from "zod";

/** Client requests a defence-file export - creates a pending review item. */
export const requestExportSchema = z.object({}).strict();
export type RequestExport = z.infer<typeof requestExportSchema>;
