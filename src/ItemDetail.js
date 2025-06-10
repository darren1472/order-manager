import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = '/api';
const CODE_KEY = '商品ID';
const NAME_KEY = '商品名';
const STOCK_KEY = '在庫p数';
const SHORTAGE_KEY = '不足（枚）';
const CASE_ORDER_KEY = 'ケース発注数';

export default function ItemDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API}?dummy=1`)
      .then(res => {
        if (!res.ok) throw new Error(`サーバーエラー: ${res.status}`);
        return res.json();
      })
      .then(data => {
        let items;
        if (Array.isArray(data)) {
          items = data;
        } else if (data.status === 'success' && Array.isArray(data.data)) {
          items = data.data;
        } else if (data.status === 'error') {
          throw new Error(data.message || 'サーバーエラーが発生しました');
        } else {
          throw new Error('データ形式が正しくありません');
        }
        const found = items.find(item => String(item[CODE_KEY]) === code);
        if (!found) throw new Error(`商品ID「${code}」が見つかりません。`);
        setItemData(found);
        setStockInput(found[STOCK_KEY] || '');
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // 送信データ（GASと同じキー名で！）
      const postBody = {
        商品ID: itemData[CODE_KEY],
        在庫p数: Number(stockInput)
      };
      console.log('POST送信データ:', postBody);

      const postResponse = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });

      if (!postResponse.ok) throw new Error(`更新エラー: ${postResponse.status}`);
      const result = await postResponse.json();
      if (result.status !== 'success') {
        throw new Error(result.message || '更新に失敗しました');
      }

      // 更新されたデータを表示用に整形
      const updatedData = result.data || {};
      setResponseData({
        inputStock: Number(stockInput),
        shortage: updatedData[SHORTAGE_KEY] || 0,
        caseOrder: updatedData[CASE_ORDER_KEY] || 0
      });

      // 2秒後に一覧画面に戻る
      setTimeout(() => {
        navigate('/', { state: { confirmedCode: code } });
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !itemData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>商品情報を読み込んでいます...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>
          エラー: {error}
        </div>
        <button onClick={() => navigate('/')}>
          一覧に戻る
        </button>
      </div>
    );
  }

  if (!itemData) {
    return <div>商品情報を読み込んでいます…</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>商品詳細</h2>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p><strong>商品コード:</strong> {code}</p>
        <p><strong>商品名:</strong> {itemData[NAME_KEY]}</p>
        <p><strong>現在の在庫p数:</strong> {itemData[STOCK_KEY]} p</p>
        <p><strong>不足枚数:</strong> {itemData[SHORTAGE_KEY]} 枚</p>
        <p><strong>ケース発注数:</strong> {itemData[CASE_ORDER_KEY]} ケース</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>今日の在庫p数を入力:</strong>
            <input
              type="number"
              value={stockInput}
              onChange={e => setStockInput(e.target.value)}
              required
              min="0"
              style={{ 
                marginLeft: '10px', 
                padding: '5px',
                width: '100px'
              }}
            />
            <span style={{ marginLeft: '5px' }}>p</span>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !stockInput}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '計算中...' : '在庫更新・計算実行'}
        </button>
      </form>

      {responseData && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '5px'
          }}
        >
          <h3 style={{ color: '#155724', marginTop: 0 }}>✅ 計算完了</h3>
          <ul style={{ marginBottom: '10px' }}>
            <li><strong>入力在庫p数:</strong> {responseData.inputStock} p</li>
            <li><strong>計算後不足枚数:</strong> {responseData.shortage} 枚</li>
            <li><strong>必要ケース発注数:</strong> {responseData.caseOrder} ケース</li>
          </ul>
          <p style={{ color: '#155724', fontSize: '14px', margin: 0 }}>
            2秒後に一覧画面に自動で戻ります...
          </p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← 一覧に戻る
        </button>
      </div>
    </div>
  );
}
