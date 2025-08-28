import { useState } from "react";
import { Combobox } from "@headlessui/react";
import type { Store } from "../../../shared/types";
import { HiChevronUpDown, HiCheck } from "react-icons/hi2";

interface StoreSearchableSelectProps {
  stores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
}

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const StoreSearchableSelect: React.FC<StoreSearchableSelectProps> = ({
  stores,
  selectedStore,
  onStoreSelect,
}) => {
  const [query, setQuery] = useState("");

  const filteredStores =
    query === ""
      ? stores
      : stores.filter((store) => {
          return store.store_name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox as="div" value={selectedStore} onChange={onStoreSelect}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light dark:bg-background-dark dark:border-gray-500 dark:text-white sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(store: Store) => store?.store_name || ""}
          placeholder="매장 이름 검색..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <HiChevronUpDown
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredStores.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-background-dark dark:ring-white/10 sm:text-sm">
            {filteredStores.map((store) => (
              <Combobox.Option
                key={store.store_id}
                value={store}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active
                      ? "bg-primary-light text-white dark:bg-primary-dark"
                      : "text-gray-900 dark:text-gray-200",
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected ? "font-semibold" : "",
                      )}
                    >
                      {store.store_name}
                    </span>
                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active
                            ? "text-white"
                            : "text-primary-light dark:text-primary-dark",
                        )}
                      >
                        <HiCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default StoreSearchableSelect;
