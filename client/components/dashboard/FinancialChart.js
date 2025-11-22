import { useEffect, useRef, useState } from 'react';

export default function FinancialChart({ data }) {
  const canvasRef = useRef(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Simple chart implementation without Chart.js for now
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw simple bar chart
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)));
    const barWidth = width / data.length / 2;
    const barSpacing = width / data.length;

    data.forEach((item, index) => {
      const x = index * barSpacing + barSpacing / 4;
      const incomeHeight = (item.income / maxValue) * (height - 40);
      const expenseHeight = (item.expense / maxValue) * (height - 40);

      // Draw income bar (green)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, height - incomeHeight - 20, barWidth / 2, incomeHeight);

      // Draw expense bar (red)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + barWidth / 2, height - expenseHeight - 20, barWidth / 2, expenseHeight);

      // Draw month label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.month, x + barWidth / 2, height - 5);
    });

    setChartLoaded(true);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fluxo Financeiro</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Carregando dados financeiros...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Fluxo Financeiro</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Receitas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Despesas</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <canvas
          ref={canvasRef}
          width={600}
          height={256}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}