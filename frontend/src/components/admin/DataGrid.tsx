import React from "react";
import { FaPlus } from "react-icons/fa";

/**
 * 데이터 그리드의 각 열(column)에 대한 정의입니다.
 * @template T - 각 행의 데이터 타입입니다.
 * @property {keyof T} accessorKey - 행 데이터 객체에서 특정 셀의 값을 가져오기 위한 키입니다.
 * @property {string} header - 열의 헤더에 표시될 텍스트입니다.
 */
export interface ColumnDef<T> {
  accessorKey: keyof T;
  header: string;
}

/**
 * DataGrid 컴포넌트의 props 타입 정의입니다.
 * @template T - 각 행의 데이터 타입으로, 고유한 'id' 값을 포함해야 합니다.
 * @property {string} title - 그리드의 제목입니다.
 * @property {T[]} data - 그리드에 표시될 데이터 배열입니다.
 * @property {ColumnDef<T>[]} columns - 그리드의 열 정의 배열입니다.
 * @property {(item: T) => void} onRowClick - 특정 행이 클릭되었을 때 호출될 콜백 함수입니다. (수정/삭제 모달 열기용)
 * @property {() => void} onAddItem - '추가하기' 버튼이 클릭되었을 때 호출될 콜백 함수입니다. (항목 추가 모달 열기용)
 */
interface DataGridProps<T extends { id: number }> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (itemId: number) => void;
  onAddItem: () => void;
}

const DataGrid = <T extends { id: number }>({
  title,
  data,
  columns,
  onRowClick,
  onAddItem,
}: DataGridProps<T>) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
        {title}
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-[#454545] overflow-hidden">
        <div className="overflow-x-auto max-h-[480px]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#454545]">
            {/* 테이블 헤더 */}
            <thead className="bg-primary-light dark:bg-primary-dark">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey as string}
                    className="px-6 py-3 text-center text-xs font-medium text-background-light dark:text-background-dark uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            {/* 테이블 본문 */}
            <tbody className="bg-white dark:bg-background-dark divide-y divide-gray-200 dark:divide-gray-400">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-primary-dark/10 cursor-pointer transition-colors duration-150"
                  onClick={() => onRowClick(item.id)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessorKey as string}
                      className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-200"
                    >
                      {/* 데이터 객체의 값을 문자열로 변환하여 표시 */}
                      {String(item[column.accessorKey])}
                    </td>
                  ))}
                </tr>
              ))}
              {/* 새 항목 추가 버튼 행 */}
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <button
                    onClick={onAddItem}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors duration-200 focus:outline-none"
                  >
                    <FaPlus />
                    추가하기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
