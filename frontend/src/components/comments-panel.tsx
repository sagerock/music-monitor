'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, Comment } from '@/lib/api';
import { MessageCircle, Send, Edit2, Trash2, Reply } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { formatDistanceToNow } from 'date-fns';
import { ClickableUsername } from '@/components/clickable-username';

interface CommentsPanelProps {
  artistId: string;
  artistName: string;
}

interface CommentItemProps {
  comment: Comment;
  artistId: string;
  onReply: (parentId: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, artistId, onReply, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateMutation = useMutation({
    mutationFn: () => commentsApi.updateComment(comment.id, editContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', artistId] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentsApi.deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', artistId] });
    },
  });

  const isOwner = user?.id === comment.userId;

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium">
            {(comment.user.name || comment.user.email)[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ClickableUsername 
              user={comment.user} 
              className="font-medium text-sm"
            />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending || !editContent.trim()}
                  className="px-3 py-1 bg-spotify-green text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                {user && !isReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="text-xs text-gray-500 hover:text-spotify-green flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this comment?')) {
                          deleteMutation.mutate();
                        }
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              artistId={artistId}
              onReply={onReply}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsPanel({ artistId, artistName }: CommentsPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', artistId, page],
    queryFn: () => commentsApi.getArtistComments(artistId, page),
  });

  const createMutation = useMutation({
    mutationFn: () => commentsApi.createComment(artistId, newComment, replyingTo || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', artistId] });
      setNewComment('');
      setReplyingTo(null);
    },
  });

  const comments = commentsData?.data || [];
  const pagination = commentsData?.pagination;

  const handleSubmit = () => {
    if (newComment.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comments</h3>
        {pagination && pagination.total > 0 && (
          <span className="text-sm text-gray-500">({pagination.total})</span>
        )}
      </div>

      {/* Comment Form */}
      {user ? (
        <div className="mb-6">
          {replyingTo && (
            <div className="mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <span className="text-sm">Replying to comment</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Share your thoughts about ${artistName}...`}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || createMutation.isPending}
              className="px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Sign in to join the conversation</p>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No comments yet</p>
          <p className="text-sm mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                artistId={artistId}
                onReply={setReplyingTo}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}