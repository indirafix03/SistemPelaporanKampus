import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function DetailLaporanAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout role="admin" pageTitle={`Detail Laporan Admin: ${id}`}>
      <div className="flex flex-col items-center justify-center h-full text-center text-[#5C403C]">
        <h1 className="text-2xl font-bold mb-4">Detail Laporan Admin untuk ID: {id}</h1>
        <p className="text-lg">Halaman ini akan menampilkan detail laporan dan opsi pengelolaan untuk admin.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-[#960006] text-white rounded-md hover:bg-[#7a0005]">Kembali</button>
      </div>
    </Layout>
  );
}