import type { UserDto } from "./user.types";

// =================================================================
// Category Types
// =================================================================
export interface CategoryDto {
  readonly id: number;
  name: string;
  description?: string;
}

// =================================================================
// Post Types
// =================================================================
export interface PostDto {
  readonly id: number;
  userId: UserDto["id"];
  title: string;
  thumbnailUrl: string;
  content: string;
  viewCount: number;
  likeCount: number;
  isDeleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

// 게시글 생성 시 사용할 데이터
export type PostCreateData = Pick<PostDto, "userId" | "title" | "content"> & {
  categoryIds?: CategoryDto["id"][];
  imageUrls?: string[];
  files?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
};

// 게시글 수정 시 사용할 데이터
export type PostUpdateData = Pick<PostDto, "id" | "title" | "content"> & {
  categoryIds?: CategoryDto["id"][];
  imageUrls?: string[];
  files?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
};

// 게시글 목록 조회용 DTO (간소화된 정보)
export type PostListDto = Pick<
  PostDto,
  "id" | "title" | "viewCount" | "likeCount" | "createdAt" | "thumbnailUrl"
> & {
  authorId: UserDto["id"];
  authorNickname: UserDto["nickname"];
  authorProfileImageUrl: UserDto["profileImageUrl"];
  categoryId: CategoryDto["id"];
  categoryName: CategoryDto["name"];
  commentCount: number;
};

// 게시글 상세 조회용 DTO (전체 정보)
export type PostDetailDto = PostDto & {
  author: Pick<UserDto, "id" | "nickname" | "profileImageUrl">;
  categories: Pick<CategoryDto, "id" | "name">[];
  comments: CommentDto[];
  images: PostImageDto[];
  files: PostFileDto[];
  isLiked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
};

// =================================================================
// Comment Types
// =================================================================
export interface CommentDto {
  readonly id: number;
  postId: PostDto["id"];
  userId: UserDto["id"];
  parentId?: CommentDto["id"]; // 대댓글용
  content: string;
  likeCount: number;
  isDeleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

// 댓글 생성 시 사용할 데이터
export type CommentCreateData = Pick<
  CommentDto,
  "postId" | "userId" | "content" | "parentId"
>;

// 댓글 수정 시 사용할 데이터
export type CommentUpdateData = Pick<CommentDto, "id" | "content">;

// 댓글 목록 조회용 DTO
export type CommentListDto = Pick<
  CommentDto,
  "id" | "content" | "likeCount" | "createdAt" | "parentId"
> & {
  author: Pick<UserDto, "id" | "nickname" | "profileImageUrl">;
  replies?: CommentListDto[]; // 대댓글들
  isLiked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
};

// =================================================================
// Post Image Types
// =================================================================
export interface PostImageDto {
  readonly id: number;
  postId: PostDto["id"];
  imageUrl: string;
  readonly uploadedAt: Date;
}

// 이미지 업로드 시 사용할 데이터
export type PostImageCreateData = Pick<PostImageDto, "postId" | "imageUrl">;

// =================================================================
// Post File Types
// =================================================================
export interface PostFileDto {
  readonly id: number;
  postId: PostDto["id"];
  fileName: string;
  fileUrl: string;
  fileSize: number;
  readonly uploadedAt: Date;
}

// 파일 업로드 시 사용할 데이터
export type PostFileCreateData = Pick<
  PostFileDto,
  "postId" | "fileName" | "fileUrl" | "fileSize"
>;

// =================================================================
// Post Category Types (N:M 관계)
// =================================================================
export interface PostCategoryDto {
  postId: PostDto["id"];
  categoryId: CategoryDto["id"];
}

// =================================================================
// Like Types
// =================================================================
export interface PostLikeDto {
  userId: UserDto["id"];
  postId: PostDto["id"];
  readonly createdAt: Date;
}

export interface CommentLikeDto {
  userId: UserDto["id"];
  commentId: CommentDto["id"];
  readonly createdAt: Date;
}

// 좋아요 토글 시 사용할 데이터
export type PostLikeToggleData = Pick<PostLikeDto, "userId" | "postId">;

export type CommentLikeToggleData = Pick<
  CommentLikeDto,
  "userId" | "commentId"
>;

// =================================================================
// Query Types
// =================================================================
export interface PostListQuery {
  categoryId?: CategoryDto["id"];
  authorId?: UserDto["id"];
  search?: string; // 제목, 내용 검색
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "viewCount" | "likeCount";
  sortOrder?: "ASC" | "DESC";
}

export interface CommentListQuery {
  postId: PostDto["id"];
  parentId?: CommentDto["id"]; // 특정 댓글의 대댓글만 조회
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "likeCount";
  sortOrder?: "ASC" | "DESC";
}

// =================================================================
// Response Types
// =================================================================
export interface PostListResponse {
  posts: PostListDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CommentListResponse {
  comments: CommentListDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// =================================================================
// Statistics Types
// =================================================================
export interface PostStatsDto {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  postsByCategory: {
    categoryId: CategoryDto["id"];
    categoryName: CategoryDto["name"];
    count: number;
  }[];
  recentPosts: PostListDto[];
  popularPosts: PostListDto[];
}

export interface UserPostStatsDto {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentPosts: PostListDto[];
}
