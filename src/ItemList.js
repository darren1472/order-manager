// src/ItemList.js
// ---------------------------------
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API = '/api';           // proxy 経由で GAS に到達する
const CODE_KEY = '商品ID';    // スプレッドシートの列タイトルと一致させる
const NAME_KEY = '商品名';
const ORDER_KEY = 'ケース発注数';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  
  // 詳細画面から渡される「確定した商品ID」がある場合にハイライトする
  const confirmedCode = location.state?.confirmedCode || null;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API}?dummy=${Date.now()}`); // キャッシュ回避
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const json = await response.json();
      console.log('GASから返ってきたデータ:', json)
      
      if (json.status !== 'success') {
        throw new Error(json.message || 'API呼び出しに失敗しました');
      }
      
      if (!Array.isArray(json.data)) {
        throw new Error('データの形式が正しくありません');
      }
      
      // _confirmed フラグをつけた配列を生成
      const newItems = json.data.map(item => ({
        ...item,
        _confirmed: item[CODE_KEY] === confirmedCode
      }));
      
      setItems(newItems);
    } catch (err) {
      console.error('ItemList fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [confirmedCode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemClick = useCallback((code) => {
    navigate(`/detail/${code}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: 'red', marginBottom: 16 }}>
          エラー: {error}
        </div>
        <button 
          onClick={handleRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          再試行
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div>商品データがありません</div>
        <button 
          onClick={handleRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginTop: 16
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h2>発注管理表（{new Date().toLocaleDateString()}）</h2>
        <button 
          onClick={handleRetry}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          更新
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => {
          const code = item[CODE_KEY];
          const name = item[NAME_KEY];
          const orderCount = item[ORDER_KEY];
          const isConfirmed = item._confirmed;

          // 必要なデータが不足している場合のハンドリング
          if (!code) {
            console.warn('商品IDが不足している項目:', item);
            return null;
          }

          return (
            <div
              key={code}
              onClick={() => handleItemClick(code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(code);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`商品 ${name || code} の詳細を表示`}
              style={{
                cursor: 'pointer',
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 8,
                backgroundColor: isConfirmed ? '#e8f5e8' : '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: isConfirmed ? '0 2px 4px rgba(0,128,0,0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isConfirmed ? '#d4edda' : '#f8f9fa';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = isConfirmed ? '#e8f5e8' : '#ffffff';
                e.target.style.transform = 'translateY(0)';
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px #007bff';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = isConfirmed ? '0 2px 4px rgba(0,128,0,0.1)' : 'none';
              }}
            >
              {isConfirmed && (
                <div style={{ 
                  color: '#28a745', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  marginBottom: 4
                }}>
                  ✓ 確定済み
                </div>
              )}
              <div style={{ fontWeight: '500' }}>
                📦 商品コード: {code}
              </div>
              <div style={{ margin: '4px 0' }}>
                📋 商品名: {name || '未設定'}
              </div>
              <div>
                📦 ケース発注数: {orderCount ?? '未設定'} ケース
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}