import React, { useEffect, useRef, useState } from "react";
import { HiPhoto } from "react-icons/hi2";
import { toast } from "sonner";
import { api } from "../api/axios";
import axios from "axios";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onImageRemove: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  uploadType: "store" | "device" | "profile" | "post";
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  onImageRemove,
  label = "이미지",
  className = "",
  disabled = false,
  uploadType,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentImageUrl ? `${import.meta.env.VITE_API_URL}${currentImageUrl}` : "",
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // currentImageUrl prop이 변경될 때마다 previewUrl 상태를 업데이트합니다.
    if (currentImageUrl) {
      setPreviewUrl(`${import.meta.env.VITE_API_URL}${currentImageUrl}`);
    } else {
      setPreviewUrl("");
    }
  }, [currentImageUrl]);

  // 이미지 업로드 함수
  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await api.post<string>(
        `/upload/${uploadType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.message ||
            "이미지 업로드 중 오류가 발생했습니다.",
        );
      } else {
        toast.error("이미지 업로드 중 알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    }
  };

  // 이미지 삭제 함수
  const deleteImage = async (imageUrl: string) => {
    try {
      // URL에서 파일명 추출
      await api.post("/upload/delete", { imageUrl });

      toast.success("이미지가 성공적으로 삭제되었습니다.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.message || "이미지 삭제 중 오류가 발생했습니다.",
        );
      } else {
        toast.error("이미지 삭제 중 알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      // 이미지 업로드
      const imageUrl = await uploadImage(file);

      // formData 업데이트
      onImageChange(imageUrl);

      // 미리보기용 로컬 URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      toast.success("이미지가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      // 백엔드 파일 삭제
      if (currentImageUrl) {
        await deleteImage(currentImageUrl);
      }

      // 상태 초기화
      onImageRemove();
      setPreviewUrl("");
    } catch (error) {
      console.error("이미지 제거 실패:", error);
      // 에러가 발생해도 UI는 초기화
      onImageRemove();
      setPreviewUrl("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 파일 선택 초기화
    e.target.value = "";
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <HiPhoto className="inline h-4 w-4 mr-1" />
        {label}
      </label>
      <div
        className={`w-full h-[147px] px-3 py-2 border-2 border-dashed rounded-md text-center transition-colors flex items-center justify-center ${
          isDragOver
            ? "border-primary-light bg-primary-light/10 dark:border-primary-dark dark:bg-primary-dark/10"
            : "border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        {previewUrl ? (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src={previewUrl}
              alt="이미지 미리보기"
              className="h-12 w-12 object-cover rounded-md"
            />
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              이미지 선택됨
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={handleImageRemove}
                disabled={isUploading}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-1 disabled:opacity-50"
              >
                {isUploading ? "처리 중..." : "제거"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <HiPhoto className="h-6 w-6 text-gray-400" />
            <p className="text-xs text-gray-600 dark:text-gray-300 my-1">
              {disabled
                ? "이미지 업로드 불가"
                : "이미지를 드래그하거나 파일 선택 버튼을 클릭하세요"}
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-primary-light rounded-md hover:bg-opacity-80 dark:bg-primary-dark mt-1 disabled:opacity-50"
              >
                {isUploading ? "업로드 중..." : "파일 선택"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
