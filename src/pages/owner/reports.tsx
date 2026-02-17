import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

type ReportType = 'outstanding' | 'village' | 'agent';

export default function ReportsPage() {
  const { user } = useAuth();
  const [type, setType] = useState<ReportType>('outstanding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateReport = async () => {
    if (!user) return;
    const ownerId = user.uid;

    let data: any[] = [];

    if (type === 'outstanding') {
      const sales = await db.sales.where({ ownerId, status: 'active' }).toArray();
      data = await Promise.all(
        sales.map(async (sale) => {
          const customer = await db.customers.get(sale.customerId);
          const village = await db.villages.get(sale.villageId);
          return {
            'Customer ID': customer?.customerNumber,
            'Customer Name': customer?.name,
            'Village': village?.name,
            'EMI Amount': sale.emiAmount,
            'Next Due': sale.nextDueDate.toLocaleDateString(),
            'Total Due': sale.emiAmount * (sale.totalEMIs - sale.emisCollected),
          };
        })
      );
    } else if (type === 'village') {
      // Aggregate by village
      const villages = await db.villages.where('ownerId').equals(ownerId).toArray();
      for (const village of villages) {
        const sales = await db.sales.where({ ownerId, villageId: village.id, status: 'active' }).toArray();
        const totalDue = sales.reduce((sum, s) => sum + s.emiAmount * (s.totalEMIs - s.emisCollected), 0);
        data.push({
          'Village': village.name,
          'Active Customers': sales.length,
          'Total Due': totalDue,
        });
      }
    } else if (type === 'agent') {
      const agents = await db.agents.where('ownerId').equals(ownerId).toArray();
      for (const agent of agents) {
        const payments = await db.payments
          .where({ ownerId, collectedByAgentId: agent.id })
          .toArray();
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        data.push({
          'Agent': agent.name,
          'Total Collected': total,
          'Transactions': payments.length,
        });
      }
    }

    // Create Excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `report_${type}_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success('Report generated');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reports & Export</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Report Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReportType)}
            className="border p-2 w-full rounded"
          >
            <option value="outstanding">Outstanding EMIs</option>
            <option value="village">Village Collections</option>
            <option value="agent">Agent Performance</option>
          </select>
        </div>

        {(type === 'outstanding' || type === 'agent') && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
        )}

        <button
          onClick={generateReport}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Generate & Download Excel
        </button>
      </div>
    </div>
  );
}