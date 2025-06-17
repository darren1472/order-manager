/*  ItemList.js – 発注一覧画面  */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listItems } from "./api";

/* アイコン（react-icons 例）*/
import { MdInventory2 as BoxIcon }     from "react-icons/md";
import { MdDescription as DocIcon }    from "react-icons/md";
import { MdLocalShipping as CaseIcon } from "react-icons/md";
import { MdRefresh as RefreshIcon }    from "react-icons/md";

const CODE_KEY  = "商品ID";
const NAME_KEY  = "商品名";
const ORDER_KEY = "ケース発注数";

export default function ItemList() {
  /* ───────── ステート / 取得ロジックは元のまま ───────── */
  const [items, setItems]   = useState([]);
  const [error, setError]   = useState(null);
  const [loading, setLoad ] = useState(true);

  const navigate   = useNavigate();
  const location   = useLocation();
  const confirmedCode = location.state?.confirmedCode || null;

  const fetchItems = useCallback(async () => {
    try {
      setLoad(true);
      setError(null);
      const json = await listItems();

      if (json.status !== "success" || !Array.isArray(json.data))
        throw new Error(json.message || "API応答が不正です");

      setItems(
        json.data.map(item => ({
          ...item,
          _confirmed: item[CODE_KEY] === confirmedCode
        }))
      );
    } catch (err) {
      console.error("ItemList fetch error:", err);
      setError(err.message || "データの取得に失敗しました");
    } finally {
      setLoad(false);
    }
  }, [confirmedCode]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ───────── JSX（UI）ここから全面 Tailwind へ ───────── */
  if (loading) return (
    <p className="py-20 text-center text-gray-600">読み込み中…</p>
  );

  if (error) return (
    <div className="p-6 text-center space-y-4">
      <p className="text-red-600">{error}</p>
      <button onClick={fetchItems}
        className="px-6 py-2 bg-primary text-white rounded-xl2 shadow-card">
        再試行
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-rose-100 pb-16">
      {/* 固定ヘッダー */}
      <header className="bg-primary text-white text-xl font-bold py-3 px-4 shadow-card sticky top-0 z-40">
        在庫管理システム
      </header>

      <main className="max-w-md mx-auto px-3 mt-6 space-y-6">
        {/* タイトル + 更新ボタン */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight">
            発注管理表<br />
            <span className="text-sm font-normal">
              （{new Date().toLocaleDateString()}）
            </span>
          </h2>

          <button onClick={fetchItems}
            className="p-3 bg-primary text-white rounded-xl2 shadow-card active:scale-95 transition">
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 一覧カード */}
        <section className="space-y-6">
          {items.map(item => (
            <Card
              key={item[CODE_KEY]}
              item={item}
              onClick={() => navigate(`/detail/${item[CODE_KEY]}`)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

/* ───────── カードコンポーネント ───────── */
function Card({ item, onClick }) {
  const isConfirmed = item._confirmed;

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
      className={`
        bg-white rounded-xl2 shadow-card p-4 space-y-2 cursor-pointer
        outline-none transition
        ${isConfirmed ? "ring-2 ring-yellow-400" : ""}
        hover:bg-gray-50 active:scale-[.98]
      `}
    >
      {isConfirmed && (
        <p className="text-yellow-600 text-xs font-bold -mb-1">✓ 発注済み</p>
      )}

      <Row icon={<BoxIcon />} label="商品コード" value={item[CODE_KEY]} />
      <Row icon={<DocIcon />} label="商品名"   value={item[NAME_KEY]} />
      <Row
        icon={<CaseIcon />}
        label="ケース発注数"
        value={`${item[ORDER_KEY]} ケース`}
        valueClass="text-red-600"
      />
    </article>
  );
}

/* 汎用行 */
function Row({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-start gap-2 text-lg">
      {icon}
      <span className="font-semibold">{label}：</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
