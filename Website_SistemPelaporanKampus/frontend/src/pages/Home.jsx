import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Home() {
  const [laporan, setLaporan] = useState([]);

  useEffect(() => {
    // Mengambil data dari FastAPI saat halaman dimuat
    api.get('/api/laporan')
      .then(response => {
        setLaporan(response.data);
      })
      .catch(error => {
        console.error("Gagal mengambil data laporan:", error);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Daftar Laporan Kampus</h2>
      {laporan.length === 0 ? (
        <p>Belum ada laporan atau server FastAPI belum dinyalakan...</p>
      ) : (
        <ul>
          {laporan.map((item) => (
            <li key={item.id}>
              <strong>{item.judul}</strong> - <small>{item.status}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;