import api from "./_axios";

export interface ChatReply {
  success: boolean;
  data: {
    reply: string;
    latencyMs: number;
    usage: {
      totalTokens: number;
    };
  };
}

/**
 * 🔥 Tembak AI
 * @param message - Pesan dari user
 * @param threadId - ID obrolan (kalo ada, biar nyambung konteksnya)
 */
export const askAIReg = async (
  message: string,
  threadId?: string,
): Promise<ChatReply> => {
  const response = await api.post(
    "/chat/ask",
    { message },
    {
      headers: {
        // Kalo threadId ada, kirim via header sesuai spek BE lu
        ...(threadId && { "x-thread-id": threadId }),
      },
    },
  );
  return response.data;
};

// Cek Status AI
export const getAIStatusReq = async () => {
  const response = await api.get("/chat/status");
  return response.data;
};

/**
 * 🔒 Tembak AI (Jalur Private/Auth Only)
 * Digunakan untuk fitur yang wajib login (pake authMiddleware di BE)
 * @param message - Pesan dari user
 * @param threadId - ID obrolan
 */
export const askAIPrivateReg = async (
  message: string,
  threadId?: string,
): Promise<ChatReply> => {
  const response = await api.post(
    "/chat/ask/private", // Endpoint khusus private
    { message },
    {
      headers: {
        // Tetap kirim threadId lewat header sesuai spek router BE
        ...(threadId && { "x-thread-id": threadId }),
      },
    },
  );
  return response.data;
};
