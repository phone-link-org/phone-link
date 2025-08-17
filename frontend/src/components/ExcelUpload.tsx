import axios from "axios";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import type {
  PriceInput,
  Addon,
  PriceSubmissionData,
} from "../../../shared/types";

type TableRow = {
  model: string;
  capacity: string;
  sk_mnp?: number;
  sk_chg?: number;
  kt_mnp?: number;
  kt_chg?: number;
  lg_mnp?: number;
  lg_chg?: number;
};
const CARRIERS = {
  "1": "SKT",
  "2": "KT",
  "3": "LG U+",
};

const apiBaseURL = import.meta.env.VITE_API_URL as string;

const ExcelUpload: React.FC = () => {
  const [data, setData] = useState<PriceInput[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([
    {
      name: "",
      carrier: "1",
      monthlyFee: 0,
      requiredDuration: 0,
      penaltyFee: 0,
    },
  ]);
  //const [addons, setAddons] = useState<Addon[]>([{ name: "", carrier: "1", monthlyFee: "", requiredDuration: "", penaltyFee: "" }]);
  const storages = new Set(["128G", "256G", "512G", "1T"]);

  const handleAddonChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const newAddons = [...addons];

    if (
      name === "monthlyFee" ||
      name === "requiredDuration" ||
      name === "penaltyFee"
    ) {
      newAddons[index] = { ...newAddons[index], [name]: parseInt(value) };
    } else if (name === "carrier") {
      const carrierKey = Object.keys(CARRIERS).find(
        (k) => CARRIERS[k as keyof typeof CARRIERS] === value,
      );
      newAddons[index] = { ...newAddons[index], [name]: carrierKey || value };
    } else {
      newAddons[index] = { ...newAddons[index], [name]: value };
    }
    newAddons[index] = { ...newAddons[index], [name]: value };

    setAddons(newAddons);
  };

  const addAddon = () => {
    setAddons([
      ...addons,
      {
        name: "",
        carrier: "1",
        monthlyFee: 0,
        requiredDuration: 0,
        penaltyFee: 0,
      },
    ]);
  };

  const removeAddon = (index: number) => {
    const newAddons = addons.filter((_, i) => i !== index);
    setAddons(newAddons);
  };

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

        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log(worksheet);

        const json = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        console.log(json);

        const parsedData = parseExcelData(json);
        console.log(parsedData);
        setTableData(toExcelStyleTable(json));
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert(
          "Failed to parse Excel file. Please check the file format and console for details.",
        );
        setFileName(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseExcelData = (rows: any[][]): PriceInput[] => {
    const results: PriceInput[] = [];

    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0] || typeof row[0] !== "string") continue;

      const modelParts = row[0].trim().split(/\s+/);
      let storage: string | null = null;
      let modelName: string = row[0];

      const lastPart = modelParts[modelParts.length - 1].toUpperCase();
      if (storages.has(lastPart)) {
        storage = lastPart;
        modelName = modelParts.slice(0, -1).join(" ").trim();
      }

      const priceByCarrier = [
        { carrier: "1", type: "MNP", price: row[1] },
        { carrier: "1", type: "CHG", price: row[2] },
        { carrier: "2", type: "MNP", price: row[3] },
        { carrier: "2", type: "CHG", price: row[4] },
        { carrier: "3", type: "MNP", price: row[5] },
        { carrier: "3", type: "CHG", price: row[6] },
      ];

      for (const c of priceByCarrier) {
        if (
          c.price !== "" &&
          c.price !== undefined &&
          !isNaN(Number(c.price))
        ) {
          results.push({
            storeId: 1, // Placeholder
            model: modelName,
            capacity: storage || "",
            carrier: c.carrier,
            buyingType: c.type as "MNP" | "CHG",
            typePrice: Number(c.price),
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
      if (!row || !row[0] || typeof row[0] !== "string") continue;

      const modelParts = row[0].trim().split(/\s+/);
      let storage: string | null = null;
      let modelName: string = row[0];

      const lastPart = modelParts[modelParts.length - 1].toUpperCase();
      if (storages.has(lastPart)) {
        storage = lastPart;
        modelName = modelParts.slice(0, -1).join(" ").trim();
      }

      result.push({
        model: modelName,
        capacity: storage || "-",
        sk_mnp: numVal(row[1]),
        sk_chg: numVal(row[2]),
        kt_mnp: numVal(row[3]),
        kt_chg: numVal(row[4]),
        lg_mnp: numVal(row[5]),
        lg_chg: numVal(row[6]),
      });
    }
    return result;
  }

  function numVal(v: any) {
    return v !== "" && v !== undefined && !isNaN(Number(v))
      ? Number(v)
      : undefined;
  }

  const handleSubmit = async () => {
    if (data.length === 0) {
      alert("No data to submit. Please upload a file first.");
      return;
    }
    setIsProcessing(true);
    try {
      const submissionData: PriceSubmissionData = {
        priceInputs: data,
        addons: addons,
        //addons: addons.map((addon) => ({
        //  ...addon,
        //  monthlyFee: Number(addon.monthlyFee) || 0,
        //  requiredDuration: Number(addon.requiredDuration) || 0,
        //  penaltyFee: Number(addon.penaltyFee) || 0
        //}))
      };
      const response = await axios.post(
        `${apiBaseURL}/api/price-input`,
        submissionData,
      );

      console.log("Server response:", response.data);
      alert("Data submitted successfully!");
      setData([]);
      setFileName(null);
      setAddons([
        {
          name: "",
          carrier: "1",
          monthlyFee: 0,
          requiredDuration: 0,
          penaltyFee: 0,
        },
      ]); // Reset addons
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(`Failed to submit data. See console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // header 구조
  const columns = [
    { carrier: "SK", mnp: "sk_mnp", chg: "sk_chg" } as const,
    { carrier: "KT", mnp: "kt_mnp", chg: "kt_chg" } as const,
    { carrier: "LG", mnp: "lg_mnp", chg: "lg_chg" } as const,
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-4">
        <label
          htmlFor="excel-upload"
          className={`cursor-pointer text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${isProcessing ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isProcessing
            ? "Processing..."
            : fileName
              ? "Change File"
              : "Select Excel File"}
        </label>
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
        {fileName && (
          <span className="text-gray-600 dark:text-gray-300">{fileName}</span>
        )}
      </div>

      {isProcessing && <div className="mt-6 text-center">Parsing file...</div>}

      {data.length > 0 && !isProcessing && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
            disabled={isProcessing}
          >
            {isProcessing
              ? "Submitting..."
              : `Submit ${tableData.length} Records`}
          </button>
          <div className="mt-4 overflow-auto max-h-96">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="border py-3 px-6 text-center align-middle"
                  >
                    기기
                  </th>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="border py-3 px-6 text-center align-middle"
                  >
                    용량
                  </th>
                  {columns.map((col) => (
                    <th
                      colSpan={2}
                      key={col.carrier}
                      className="border py-2 px-4 text-center"
                    >
                      {col.carrier}
                    </th>
                  ))}
                </tr>
                <tr>
                  {columns.map((col) => (
                    <React.Fragment key={col.carrier}>
                      <th className="border py-1 px-2 bg-gray-50 text-center">
                        번호이동
                      </th>
                      <th className="border py-1 px-2 bg-gray-50 text-center">
                        기기변경
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="py-4 px-6 text-center">{row.model}</td>
                    <td className="py-4 px-6 text-center">{row.capacity}</td>
                    <td className="py-4 px-6 text-center">
                      {row.sk_mnp ?? "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.sk_chg ?? "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.kt_mnp ?? "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.kt_chg ?? "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.lg_mnp ?? "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.lg_chg ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              부가서비스
            </label>
            {addons.map((addon, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  name="name"
                  value={addon.name}
                  onChange={(e) => handleAddonChange(index, e)}
                  placeholder="부가서비스명"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                />
                <input
                  type="text"
                  name="carrier"
                  value={
                    CARRIERS[addon.carrier as keyof typeof CARRIERS] ||
                    addon.carrier
                  }
                  onChange={(e) => handleAddonChange(index, e)}
                  list="carrier-options"
                  placeholder="통신사 선택 또는 입력"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                />
                <datalist id="carrier-options">
                  {Object.values(CARRIERS).map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <input
                  type="number"
                  name="monthlyFee"
                  value={addon.monthlyFee ?? ""}
                  onChange={(e) => handleAddonChange(index, e)}
                  placeholder="월 요금"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                />
                <input
                  type="number"
                  name="requiredDuration"
                  value={addon.requiredDuration ?? ""}
                  onChange={(e) => handleAddonChange(index, e)}
                  placeholder="유지 기간 (개월)"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                />
                <input
                  type="number"
                  name="penaltyFee"
                  value={addon.penaltyFee ?? ""}
                  onChange={(e) => handleAddonChange(index, e)}
                  placeholder="미가입시 발생 요금(만원)"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAddon}
              className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + 부가서비스 추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
