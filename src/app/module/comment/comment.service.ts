import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { UpdateCommentPayload } from "./comment.validation";

const createComment = async (userId: string, payload: any) => {
  const { content, reviewId, parentId } = payload;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

   const comment = await prisma.comment.create({
    data: {
      content,
      reviewId,
      userId,
      parentId: parentId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
};

const getCommentsByReview = async (
  reviewId: string,
  query: Record<string, string | undefined>,
) => {
  const { page = "1", limit = "20" } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        reviewId,
        isDeleted: false,
        parentId: null, // only parent
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replies: {
          where: {
            isDeleted: false,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),

    prisma.comment.count({
      where: {
        reviewId,
        isDeleted: false,
        parentId: null, // count only parents
      },
    }),
  ]);

  return {
    data: comments,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const updateComment = async (id: string, userId: string, payload: UpdateCommentPayload) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  if (comment.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Cannot edit a deleted comment");
  }

  if (comment.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only edit your own comments");
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content: payload.content },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  return updatedComment;
};

const deleteComment = async (id: string, userId: string, userRole: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  if (comment.userId !== userId && userRole !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You can only delete your own comments");
  }

  await prisma.comment.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return { message: "Comment deleted successfully" };
};

export const CommentService = {
  createComment,
  getCommentsByReview,
  updateComment,
  deleteComment,
};
