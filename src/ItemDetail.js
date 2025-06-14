import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listItems, updateItem } from './api';

const CODE_KEY  = '商品ID';
const NAME_KEY  = '商品名';
const STOCK_KEY = '在庫数';

export default function ItemDetail() {
  const { code }      = useParams();     // ルート /detail/:code で受け取る
  const navigate      = useNavigate();
  const [item,  setItem]  = useState(null);
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);

  /** ---------- 1. 詳細データ取得 ---------- */
  useEffect(() => {
    listItems()
      .then(json => {
        if (json.status !== 'success') throw new Error(json.message);

        const found = json.data.find(r => String(r[CODE_KEY]) === String(code));
        if (!found) throw new Error('該当商品が見つかりません');

        setItem(found);
        setStock(found[STOCK_KEY] ?? 0);
      })
      .catch(err => setError(err.message));
  }, [code]);

  /** ---------- 2. 在庫数を保存 ---------- */
  const handleSave = async () => {
    try {
      setError(null);

      // バリデーション: 数値以外は弾く
      const newPv = Number(stock);
      if (Number.isNaN(newPv) || newPv < 0) {
        throw new Error('在庫数は 0 以上の数字で入力してください');
      }

      const res = await updateItem(code, newPv);
      if (res.status !== 'success') throw new Error(res.message);

      navigate('/', { state: { confirmedCode: code } });
    } catch (err) {
      setError(err.message);
    }
  };

  /** ---------- レンダリング ---------- */
  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: 'red' }}>エラー: {error}</p>
        <button onClick={() => navigate('/')}>一覧に戻る</button>
      </div>
    );
  }

  if (!item) return <p style={{ padding: 16 }}>読み込み中…</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>商品詳細</h2>
      <p>商品コード: {item[CODE_KEY]}</p>
      <p>商品名&nbsp;&nbsp;&nbsp;: {item[NAME_KEY]}</p>

      <label>
        在庫数:
        <input
          type="number"
          value={stock}
          min="0"
          step="1"
          onChange={e => setStock(e.target.value)}
          style={{ marginLeft: 8, width: 120 }}
        />
      </label>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSave} style={{ marginRight: 8 }}>保存</button>
        <button onClick={() => navigate('/')}>キャンセル</button>
      </div>
    </div>
  );
}
