import axios from 'axios';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface Input {
  devices: string;
  carrier: number; // 1: SK, 2: KT, 3: LG
  buyingType: 'MNP' | 'CHG';
  typePrice: number;
//  addons: string;
//  addonsFee: number;
//  addonsRequiredDuration: number; // in months
  location: string;
}

type TableRow = {
  device: string,
  sk_mnp?: number, sk_chg?: number,
  kt_mnp?: number, kt_chg?: number,
  lg_mnp?: number, lg_chg?: number,
};

const apiBaseURL = import.meta.env.VITE_API_URL as string;

const ExcelUpload: React.FC = () => {
  const [data, setData] = useState<Input[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        if (!binaryStr) throw new Error("Failed to read file");

        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log(worksheet)

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        console.log(json)

        const parsedData = parseExcelData(json);
        console.log(parsedData);
        setTableData(toExcelStyleTable(json))
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Failed to parse Excel file. Please check the file format and console for details.");
        setFileName(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseExcelData = (rows: any[][]): Input[] => {
  const results: Input[] = [];
  let location = "Unknown";
    if (rows.length > 0 && typeof rows[0][0] === 'string') location = rows[0][0]

  // 실제 데이터는 5번째 행(=인덱스 4) 부터 시작:
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0] || typeof row[0] !== 'string') continue;
    const devices = row[0].trim();

    // 각 통신사별 가격 뽑기
    const priceByCarrier = [
        { carrier: 1, type: 'MNP', price: row[1] },
        { carrier: 1, type: 'CHG', price: row[2] },
        { carrier: 2, type: 'MNP', price: row[3] },
        { carrier: 2, type: 'CHG', price: row[4] },
        { carrier: 3, type: 'MNP', price: row[5] },
        { carrier: 3, type: 'CHG', price: row[6] }
      ];
    for(const c of priceByCarrier) {
        if (c.price !== '' && c.price !== undefined && !isNaN(Number(c.price))) {
          results.push({
            devices,
            carrier: c.carrier,
            buyingType: c.type as 'MNP' | 'CHG',
            typePrice: Number(c.price),
            location
          });
        }
    }
  }
  return results;
};


  function toExcelStyleTable(rows: any[][]): TableRow[] {
    const result: TableRow[] = [];
    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0] || typeof row[0] !== 'string') continue;
      result.push({
        device: row[0],
        sk_mnp: numVal(row[1]),
        sk_chg: numVal(row[2]),
        kt_mnp: numVal(row[3]),
        kt_chg: numVal(row[4]),
        lg_mnp: numVal(row[5]),
        lg_chg: numVal(row[6]),
      })
    }
    return result;
  }

  function numVal(v: any) {
   return (v !== '' && v !== undefined && !isNaN(Number(v)) ? Number(v) : undefined)
  }


  const handleSubmit = async () => {
    if (data.length === 0) {
      alert('No data to submit. Please upload a file first.');
      return;
    }
    setIsProcessing(true);
    try {
      const promises = data.map(item =>
        axios.post(`${apiBaseURL}/api/price-input`, item)
      );

      const responses = await Promise.all(promises);

      console.log('Server responses:', responses);
      alert(`Data submitted successfully! Server responded ${responses.length} times.`);
      setData([]);
      setFileName(null);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert(`Failed to submit data. See console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

   // header 구조
  const columns = [
    { carrier: 'SK', mnp: 'sk_mnp', chg: 'sk_chg' } as const,
    { carrier: 'KT', mnp: 'kt_mnp', chg: 'kt_chg' } as const,
    { carrier: 'LG', mnp: 'lg_mnp', chg: 'lg_chg' } as const
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-4">
        <label htmlFor="excel-upload" className={`cursor-pointer text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${isProcessing ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
          {isProcessing ? 'Processing...' : (fileName ? 'Change File' : 'Select Excel File')}
        </label>
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
        {fileName && <span className="text-gray-600 dark:text-gray-300">{fileName}</span>}
      </div>

      {isProcessing && <div className="mt-6 text-center">Parsing file...</div>}

      {data.length > 0 && !isProcessing && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            disabled={isProcessing}
          >
            {isProcessing ? 'Submitting...' : `Submit ${data.length} Records`}
          </button>
          <div className="mt-4 overflow-auto max-h-96">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th rowSpan={2} scope="col" className="border py-3 px-6 text-center align-middle">기기</th>
                  {columns.map(col => (
                    <th colSpan={2} key={col.carrier} className="border py-2 px-4 text-center">{col.carrier}</th>
                  ))}
                </tr>
                <tr>
                  {columns.map(col => (
                    <React.Fragment key={col.carrier}>
                      <th className='border py-1 px-2 bg-gray-50 text-center'>번호이동</th>
                      <th className='border py-1 px-2 bg-gray-50 text-center'>기기변경</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="py-4 px-6 text-center">{row.device}</td>
                    <td className="py-4 px-6 text-center">
                      {row.sk_mnp ?? '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.sk_chg ?? '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.kt_mnp ?? '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.kt_chg ?? '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.lg_mnp ?? '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.lg_chg ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
