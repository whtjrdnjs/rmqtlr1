/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORE_URL =
  'https://script.google.com/macros/s/AKfycbxrkBX9P4QLgVOcBD7s8c94WsSffczQ23zX9BI8muPyQwqhASmj80zumtvuj9mX1LdPJA/exec';
const APP = 'rmqtlr';

export interface StoreRecord {
  id: string;
  time?: string;
  user?: string | null;
  private?: boolean;
  data?: Record<string, unknown>;
}

export interface StoreResponse {
  ok: boolean;
  items?: StoreRecord[];
  item?: StoreRecord;
  token?: string;
  name?: string;
  error?: string;
  code?: string;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(APP + ':token');
  } catch {
    return null;
  }
}

export function setToken(t: string | null): void {
  try {
    if (t) localStorage.setItem(APP + ':token', t);
    else localStorage.removeItem(APP + ':token');
  } catch {
    // ignore storage errors
  }
}

export async function store(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<StoreResponse> {
  const token = getToken();
  if (action === 'me' && !token) {
    throw Object.assign(new Error('로그인하지 않았어요.'), { code: 'login' });
  }
  let res: Response;
  let out: StoreResponse;
  try {
    res = await fetch(STORE_URL, {
      method: 'POST',
      body: JSON.stringify({ ...payload, action, app: APP, token }),
    });
  } catch {
    throw Object.assign(
      new Error('저장소에 연결하지 못했어요. 잠시 뒤 다시 해 보세요.'),
      { code: 'network' }
    );
  }
  try {
    out = await res.json();
  } catch {
    throw Object.assign(
      new Error(
        '저장소의 대답을 읽지 못했어요. STORE_URL이 /exec로 끝나는 주소인지 확인하세요.'
      ),
      { code: 'bad_response' }
    );
  }
  if (out.token) setToken(out.token);
  if (action === 'logout' || out.code === 'login') setToken(null);
  if (!out.ok) {
    throw Object.assign(new Error(out.error || '저장소 오류가 발생했어요.'), {
      code: out.code,
    });
  }
  return out;
}
