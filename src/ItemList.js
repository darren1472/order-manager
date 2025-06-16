// src/ItemList.js
// ---------------------------------
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listItems } from "./api";

const CODE_KEY  = "商品ID";
const NAME_KEY  = "商品名";
const ORDER_KEY = "ケース発注数";

export default function ItemList() {
  const [items, setItems]   = useState([]);
  const [error, setError]   = useState(null);
  const [loading, setLoad]  = useState(true);

  const navigate  = useNavigate();
  const location  = useLocation();
  const confirmedCode = location.state?.confirmedCode || null;

  /* ---------- データ取得 ---------- */
  const fetchItems = useCallback(async () => {
    try {
      setLoad(true);
      setError(null);

      const json = await listItems();

      if (json.status !== "success" || !Array.isArray(json.data))
        throw new Error(json.message || "API応答が不正です");

      const newItems = json.data.map(item => ({
        ...item,
        _confirmed: item[CODE_KEY] === confirmedCode
      }));

      setItems(newItems);
    } catch (err) {
      console.error("ItemList fetch error:", err);
      setError(err.message || "データの取得に失敗しました");
    } finally {
      setLoad(false);
    }
  }, [confirmedCode]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ---------- ハンドラ ---------- */
  const handleItemClick = code => navigate(`/detail/${code}`);
  const handleRetry     = () => fetchItems();

  /* ---------- 画面 ---------- */
  if (loading) return <p style={{ padding:16,textAlign:"center" }}>読み込み中...</p>;

  if (error) return (
    <div style={{ padding:16 }}>
      <div style={{ color:"red", marginBottom:16 }}>エラー: {error}</div>
      <button onClick={handleRetry} style={btn}>再試行</button>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ padding:16, textAlign:"center" }}>
      <div>商品データがありません</div>
      <button onClick={handleRetry} style={{ ...btn, marginTop:16 }}>再読み込み</button>
    </div>
  );

  return (
    <div style={{ padding:16 }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2>発注管理表（{new Date().toLocaleDateString()}）</h2>
        <button onClick={handleRetry} style={{ ...btn, background:"#6c757d", fontSize:14 }}>更新</button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {items.map(item => {
          const code        = item[CODE_KEY];
          const name        = item[NAME_KEY];
          const orderCount  = item[ORDER_KEY];
          const isConfirmed = item._confirmed;

          if (!code) return null;

          /* ▼▼ カードのスタイルを動的に決定 ▼▼ */
          const baseStyle = {
            cursor:"pointer",
            padding:12,
            border:"1px solid",
            borderColor: isConfirmed ? "#f6e58d" : "#ccc",
            borderRadius:8,
            background:   isConfirmed ? "#fff9db" : "#fff",
            transition:"all .2s",
            outline:"none",
            boxShadow:    isConfirmed ? "0 2px 4px rgba(128,128,0,.15)" : "none"
          };

          return (
            <div
              key={code}
              onClick={() => handleItemClick(code)}
              onKeyDown={e=>{
                if(e.key==="Enter"||e.key===" ") handleItemClick(code);
              }}
              tabIndex={0}
              role="button"
              aria-label={`商品 ${name||code} の詳細を表示`}
              style={baseStyle}
              onMouseEnter={e=>{
                e.currentTarget.style.background = isConfirmed ? "#fff4c2" : "#f8f9fa";
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background = isConfirmed ? "#fff9db" : "#fff";
              }}
              onFocus={e=>{
                e.currentTarget.style.boxShadow = "0 0 0 2px #007bff";
              }}
              onBlur={e=>{
                e.currentTarget.style.boxShadow = isConfirmed
                  ? "0 2px 4px rgba(128,128,0,.15)"
                  : "none";
              }}
            >
              {isConfirmed && (
                <div style={{color:"#d49b00",fontWeight:"bold",fontSize:12,marginBottom:4}}>
                  ✓ 発注済み
                </div>
              )}
              <div style={{ fontWeight:500 }}>📦 商品コード: {code}</div>
              <div style={{ margin:"4px 0" }}>📋 商品名: {name || "未設定"}</div>
              <div>📦 ケース発注数: {orderCount ?? "未設定"} ケース</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 汎用ボタンスタイル ---------- */
const btn = {
  padding:"8px 16px",
  background:"#007bff",
  color:"#fff",
  border:"none",
  borderRadius:4,
  cursor:"pointer"
};
