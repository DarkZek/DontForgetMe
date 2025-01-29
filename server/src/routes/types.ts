import { type Static, Type } from "@sinclair/typebox";

export const TokenHeader = Type.Object({
    fcmToken: Type.String()
})

export type TokenHeaderType = Static<typeof TokenHeader>
