// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ItemList from './ItemList';
import ItemDetail from './ItemDetail';

function App() {
  return (
    <Router>
      <div>
        

        {/* ─── ヘッダー ─── */}
        <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          {/* <h1>在庫管理システム</h1> */}
        </header>

        {/* ─── メインルーティング ─── */}
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ItemList />} />
            <Route path="/detail/:code" element={<ItemDetail />} />

            {/* 404 フォールバック */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <h2>ページが見つかりません</h2>
                  <p>お探しのページは存在しません。</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
