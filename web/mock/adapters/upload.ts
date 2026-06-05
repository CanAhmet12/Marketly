import { isMockDataEnabled } from "../config";

/** Upload formu — gerçek insert yapılmadığında kullanıcıya dönen mesaj */
export const MOCK_UPLOAD_BLOCKED_MESSAGE =
  "Mock mode açık: içerik kaydedilmedi. Tasarım önizlemesi için kullanılır.";

export function shouldInterceptMockUpload(): boolean {
  return isMockDataEnabled();
}
