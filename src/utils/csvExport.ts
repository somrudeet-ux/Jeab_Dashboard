import { FeedbackItem, QUESTIONS, getLikertInterpretation } from '../types';

export function exportFeedbacksToCSV(feedbacks: FeedbackItem[], filename = 'ผลประเมินความพึงพอใจการอบรม.csv') {
  if (!feedbacks || feedbacks.length === 0) {
    alert('ยังไม่มีข้อมูลการประเมินให้ดาวน์โหลด');
    return;
  }

  // Header row
  const headers = [
    'ลำดับ (No.)',
    'วันเวลาที่ตอบ (Date & Time)',
    `ข้อ 1: ${QUESTIONS[0].shortLabel}`,
    `ข้อ 2: ${QUESTIONS[1].shortLabel}`,
    `ข้อ 3: ${QUESTIONS[2].shortLabel}`,
    `ข้อ 4: ${QUESTIONS[3].shortLabel}`,
    `ข้อ 5: ${QUESTIONS[4].shortLabel}`,
    'คะแนนเฉลี่ยรวม (Average)',
    'ระดับการแปลผล (Interpretation)',
    'ข้อเสนอแนะเพิ่มเติม (Comments)'
  ];

  const escapeCSV = (value: string | number) => {
    const stringVal = String(value ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const rows = feedbacks.map((item, index) => {
    const dateFormatted = new Date(item.createdAt).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const interpretation = getLikertInterpretation(item.average).label;

    return [
      index + 1,
      dateFormatted,
      item.q1,
      item.q2,
      item.q3,
      item.q4,
      item.q5,
      item.average.toFixed(2),
      interpretation,
      item.comment || '-'
    ].map(escapeCSV).join(',');
  });

  // Calculate Overall Averages
  const totalCount = feedbacks.length;
  const avgQ1 = (feedbacks.reduce((s, f) => s + f.q1, 0) / totalCount).toFixed(2);
  const avgQ2 = (feedbacks.reduce((s, f) => s + f.q2, 0) / totalCount).toFixed(2);
  const avgQ3 = (feedbacks.reduce((s, f) => s + f.q3, 0) / totalCount).toFixed(2);
  const avgQ4 = (feedbacks.reduce((s, f) => s + f.q4, 0) / totalCount).toFixed(2);
  const avgQ5 = (feedbacks.reduce((s, f) => s + f.q5, 0) / totalCount).toFixed(2);
  const grandAvg = (feedbacks.reduce((s, f) => s + f.average, 0) / totalCount).toFixed(2);

  const summaryRow = [
    'ค่าเฉลี่ยสรุปทั้งหมด',
    `รวมผู้ตอบ ${totalCount} คน`,
    avgQ1,
    avgQ2,
    avgQ3,
    avgQ4,
    avgQ5,
    grandAvg,
    getLikertInterpretation(Number(grandAvg)).label,
    '-'
  ].map(escapeCSV).join(',');

  // UTF-8 BOM (\uFEFF) ensures Excel displays Thai characters perfectly without mojibake
  const csvContent = '\uFEFF' + [headers.join(','), ...rows, '', summaryRow].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
