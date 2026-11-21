import {
  Boxes,
  Weight,
  ClipboardList,
  ChartNoAxesCombined,
  Plus,
  Leaf,
  ArrowUpRight,
} from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import StatCard from '../components/common/StatCard.jsx';
import RecordTable from '../components/records/RecordTable.jsx';
import { formatDate, formatNumber, today } from '../utils/formatters.js';

export default function DashboardPage({ data, onAdd, onNavigate }) {
  const todayData = data?.today || {};
  const all = data?.allTime || {};

  return (
    <>
      <PageHeading
        eyebrow="RINGKASAN AKTIVITAS"
        title="Dashboard"
        description="Pantau hasil panen dan aktivitas pencatatan dalam satu tempat."
        action={
          <button className="btn btn-primary" onClick={onAdd} type="button">
            <Plus size={17} /> Catat Panen
          </button>
        }
      />
      <div className="welcome-banner">
        <div>
          <span className="banner-tag">
            <Leaf size={13} /> PANEN TERDATA, KERJA TERARAH
          </span>
          <h2>Selamat datang di PanenKu</h2>
          <p>Kelola pencatatan tandan hasil panen dengan lebih rapi dan mudah.</p>
        </div>
        <div className="banner-art">
          <div className="sun" />
          <div className="hill hill-one" />
          <div className="hill hill-two" />
          <Leaf className="banner-leaf" size={76} />
        </div>
      </div>
      <div className="section-title">
        <div>
          <h3>Ringkasan hari ini</h3>
          <p>Akumulasi pencatatan pada tanggal {formatDate(today)}.</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={Boxes}
          label="Total tandan hari ini"
          value={formatNumber(todayData.total_bunches)}
          unit="tandan"
          tone="green"
        />
        <StatCard
          icon={Weight}
          label="Berat hari ini"
          value={formatNumber(todayData.total_weight_kg)}
          unit="kg"
          tone="orange"
        />
        <StatCard
          icon={ClipboardList}
          label="Transaksi hari ini"
          value={formatNumber(todayData.total_records)}
          unit="catatan"
          tone="blue"
        />
        <StatCard
          icon={ChartNoAxesCombined}
          label="Total tandan keseluruhan"
          value={formatNumber(all.total_bunches)}
          unit="tandan"
          tone="purple"
        />
      </div>
      <div className="section-title table-section-heading">
        <div>
          <h3>Catatan terbaru</h3>
          <p>Enam pencatatan terakhir yang masuk ke sistem.</p>
        </div>
        <button className="text-btn" onClick={() => onNavigate('records')} type="button">
          Lihat semua <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="panel table-panel">
        <RecordTable rows={data?.recent || []} compact />
      </div>
    </>
  );
}
