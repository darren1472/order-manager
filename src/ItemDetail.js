import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listItems, updateItem } from "./api";

const CODE_KEY  = "商品ID";
const NAME_KEY  = "商品名";
const STOCK_KEY = "在庫数";

export default function ItemDetail() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [item,  setItem]  = useState(null);
  const [stock, setStock] = useState("");
  const [error, setError] = useState(null);

  /* ---------- 1. 詳細データ取得 ---------- */
  useEffect(() => {
    listItems()
      .then(json => {
        if (json.status !== "success") throw new Error(json.message);
        const found = json.data.find(r => String(r[CODE_KEY]) === String(code));
        if (!found) throw new Error("該当商品が見つかりません");
        setItem(found);
        setStock(found[STOCK_KEY] ?? 0);
      })
      .catch(err => setError(err.message));
  }, [code]);

  /* ---------- 2. 在庫数を保存 ---------- */
  const handleSave = async () => {
    try {
      setError(null);
      const newPv = Number(stock);
      if (Number.isNaN(newPv) || newPv < 0) {
        throw new Error("在庫数は 0 以上の数字で入力してください");
      }
      const res = await updateItem(code, newPv);
      if (res.status !== "success") throw new Error(res.message);
      navigate("/", { state: { confirmedCode: code } });
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------- 3. 画面 ---------- */
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">エラー: {error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  if (!item) return <p className="p-6">読み込み中…</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-xl">
      {/* 見出し ------------------------------------------------ */}
      <h2 className="text-2xl font-bold text-sky-700 mb-6 border-b pb-2">
        商品詳細
      </h2>

      {/* 商品情報 -------------------------------------------- */}
      <div className="mb-8 text-lg space-y-2">
        <p>
          <span className="inline-block w-28 font-semibold">商品コード</span>
          {item[CODE_KEY]}
        </p>
        <p>
          <span className="inline-block w-28 font-semibold">商品名</span>
          {item[NAME_KEY]}
        </p>
      </div>

      {/* 在庫入力欄 ------------------------------------------ */}
      <label className="block mb-10">
        <span className="block font-semibold mb-1">在庫数</span>
        <input
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          placeholder="0"
          className="
            w-36 text-center
            border-2 border-gray-400 rounded-lg
            focus:border-sky-500 focus:ring-sky-500
            px-3 py-2 text-xl tracking-wider
          "
        />
      </label>

      {/* 操作ボタン ------------------------------------------ */}
      <div className="flex gap-4 text-center">
        <button
          onClick={handleSave}
          className="
            flex-1 py-3 bg-sky-600 text-white text-lg font-semibold rounded-lg
            hover:bg-sky-700 active:bg-sky-800
            focus:outline-none focus:ring-2 focus:ring-sky-400
          "
        >
          保存
        </button>

        <button
          onClick={() => navigate("/")}
          className="
            flex-1 py-3 bg-gray-400 text-white text-lg font-semibold rounded-lg
            hover:bg-gray-500 active:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-gray-500
          "
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
