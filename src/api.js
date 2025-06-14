/**
 * GAS Web Apps への通信ラッパー
 * - 開発時   : `/api`  →  setupProxy.js が転送
 * - 本番ビルド: 環境変数 REACT_APP_GAS_URL に置き換え
 */
const API_BASE =
  process.env.REACT_APP_GAS_URL?.replace(/\/$/, '') || '/api'; // 末尾スラッシュ除去

/** ---------- 一覧取得 ---------- */
export async function listItems() {
  const res = await fetch(`${API_BASE}?action=list`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

/** ---------- 在庫数を更新 ---------- */
export async function updateItem(id, pv) {
  const params = new URLSearchParams({
    '商品ID': String(id),
    '在庫p数': String(pv)
  });

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      // シンプルリクエストにすることでプリフライト（OPTIONS）を回避
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: params.toString()
  });

  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}
