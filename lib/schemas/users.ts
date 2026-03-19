import { z } from "zod"

export const CombeeUserColorPalette = [
  "#78D2F0",
  "#0F3C41",
  "#E6CD37",
  "#327364",
  "#DCFAB9",
  "#69B9CD",
] as const

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100, "Nombre demasiado largo"),
  color: z.enum(CombeeUserColorPalette, {
    errorMap: () => ({ message: "Color inválido" }),
  }),
})

