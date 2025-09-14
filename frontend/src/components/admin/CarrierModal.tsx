import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../api/axios";
import type { CarrierDto } from "../../../../shared/carrier.types";
import ImageUpload from "../ImageUpload";

interface CarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  carrierData?: CarrierDto | null;
  onSave: () => void;
}

const CarrierModal: React.FC<CarrierModalProps> = ({ isOpen, onClose, carrierData, onSave }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CarrierDto>({
    defaultValues: carrierData || { name: "", imageUrl: "" },
  });

  useEffect(() => {
    if (carrierData) {
      reset(carrierData);
    } else {
      reset({ id: 0, name: "", imageUrl: "" });
    }
  }, [carrierData, reset]);

  const onValid = async (data: CarrierDto) => {
    try {
      await api.post("/admin/carrier", data);
      toast.success("통신사 정보가 저장되었습니다.");
      onSave();
      onClose();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background-light dark:bg-background-dark p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {carrierData?.id ? "통신사 수정" : "통신사 추가"}
                </Dialog.Title>
                <form onSubmit={handleSubmit(onValid)} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      통신사명
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name", {
                        required: "통신사명을 입력해주세요.",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:bg-[#292929] dark:border-gray-500 dark:text-white"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        currentImageUrl={field.value}
                        onImageChange={field.onChange}
                        onImageRemove={() => field.onChange("")}
                        label="통신사 로고"
                        uploadType="carrier"
                      />
                    )}
                  />

                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-primary-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-opacity-80"
                    >
                      저장
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CarrierModal;
