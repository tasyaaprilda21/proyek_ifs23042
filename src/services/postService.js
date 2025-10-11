import api from "./apiClient";

// ✅ Tambah postingan
export const addPost = async (formData) => {
  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Ambil semua postingan
export const getAllPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

// ✅ Ambil detail postingan (termasuk user, likes, comments)
export const getPostDetail = async (id) => {
  const res = await api.get(`/posts/${id}?include=likes,comments,user`);
  return res.data;
};

// ✅ Update postingan
export const updatePost = async (id, formData) => {
  if (formData instanceof FormData) {
    formData.append("_method", "PUT");
  } else {
    const fd = new FormData();
    for (const key in formData) fd.append(key, formData[key]);
    fd.append("_method", "PUT");
    formData = fd;
  }

  const res = await api.post(`/posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Hapus postingan
export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

// ✅ Like / Unlike postingan
export const addLike = async (id, like = 1) => {
  const res = await api.post(
    `/posts/${id}/likes`,
    new URLSearchParams({ like })
  );
  return res.data;
};

// ✅ Tambah komentar (harus pakai Authorization)
export const addComment = async (id, text) => {
  const res = await api.post(
    `/posts/${id}/comments`,
    new URLSearchParams({ comment: text }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return res.data;
};

// ✅ Hapus komentar (sesuai modul kamu → DELETE /posts/:id/comments)
export const deleteComment = async (postId) => {
  const res = await api.delete(`/posts/${postId}/comments`);
  return res.data;
};

// ✅ Ambil semua komentar untuk 1 postingan
export const getPostComments = async (id) => {
  const res = await api.get(`/posts/${id}/comments`);
  return res.data;
};
