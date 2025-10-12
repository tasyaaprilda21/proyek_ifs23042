import api from "./apiClient";

/**
 * 🔹 ADD NEW POST
 * URL: /posts
 * Method: POST
 * Headers: Content-Type: multipart/form-data, Authorization: Bearer <token>
 * Body: cover (file), description (string)
 */
export const addPost = async (formData) => {
  try {
    const res = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Add post error:", err.response || err);
    throw err.response?.data || { message: "Gagal menambah postingan" };
  }
};

/**
 * 🔹 GET ALL POSTS
 * URL: /posts
 * Method: GET
 * Parameters: is_me (1 to get own posts)
 * Headers: Authorization: Bearer <token>
 */
export const getAllPosts = async (isMe = false) => {
  try {
    const params = isMe ? { is_me: 1 } : {};
    const res = await api.get("/posts", { params });
    console.log("Posts response:", res.data); // Debug log
    return res.data;
  } catch (err) {
    console.error("Get posts error:", err.response || err);
    throw err.response?.data || { message: "Gagal mengambil postingan" };
  }
};

/**
 * 🔹 GET POST DETAIL
 * URL: /posts/:id
 * Method: GET
 * Headers: Authorization: Bearer <token>
 */
export const getPostDetail = async (id) => {
  try {
    const res = await api.get(`/posts/${id}`);
    console.log("Post detail response:", res.data); // Debug log
    return res.data;
  } catch (err) {
    console.error("Get post detail error:", err.response || err);
    throw err.response?.data || { message: "Gagal mengambil detail postingan" };
  }
};

/**
 * 🔹 UPDATE POST
 * URL: /posts/:id
 * Method: PUT
 * Headers: Content-Type: application/x-www-form-urlencoded, Authorization: Bearer <token>
 * Body: description (string)
 */
export const updatePost = async (id, description) => {
  try {
    const res = await api.put(`/posts/${id}`, new URLSearchParams({ description }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (err) {
    console.error("Update post error:", err.response || err);
    throw err.response?.data || { message: "Gagal mengubah postingan" };
  }
};

/**
 * 🔹 CHANGE COVER POST
 * URL: /posts/:id/cover
 * Method: POST
 * Headers: Content-Type: multipart/form-data, Authorization: Bearer <token>
 * Body: cover (file)
 */
export const changeCoverPost = async (id, coverFile) => {
  try {
    const formData = new FormData();
    formData.append("cover", coverFile);
    
    const res = await api.post(`/posts/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Change cover error:", err.response || err);
    throw err.response?.data || { message: "Gagal mengubah cover" };
  }
};

/**
 * 🔹 DELETE POST
 * URL: /posts/:id
 * Method: DELETE
 * Headers: Authorization: Bearer <token>
 */
export const deletePost = async (id) => {
  try {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete post error:", err.response || err);
    throw err.response?.data || { message: "Gagal menghapus postingan" };
  }
};

/**
 * 🔹 ADD LIKE
 * URL: /posts/:id/likes
 * Method: POST
 * Headers: Content-Type: application/x-www-form-urlencoded, Authorization: Bearer <token>
 * Body: like (1 | 0) - 1 for like, 0 for unlike
 */
export const addLike = async (id, like = 1) => {
  try {
    const res = await api.post(
      `/posts/${id}/likes`,
      new URLSearchParams({ like: like.toString() }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Add like error:", err.response || err);
    throw err.response?.data || { message: "Gagal menambah like" };
  }
};

/**
 * 🔹 ADD COMMENT
 * URL: /posts/:id/comments
 * Method: POST
 * Headers: Content-Type: application/x-www-form-urlencoded, Authorization: Bearer <token>
 * Body: comment (string)
 */
export const addComment = async (id, comment) => {
  try {
    const res = await api.post(
      `/posts/${id}/comments`,
      new URLSearchParams({ comment }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Add comment error:", err.response || err);
    throw err.response?.data || { message: "Gagal menambah komentar" };
  }
};

/**
 * 🔹 DELETE COMMENT
 * URL: /posts/:id/comments
 * Method: DELETE
 * Headers: Authorization: Bearer <token>
 */
export const deleteComment = async (id) => {
  try {
    const res = await api.delete(`/posts/${id}/comments`);
    return res.data;
  } catch (err) {
    console.error("Delete comment error:", err.response || err);
    throw err.response?.data || { message: "Gagal menghapus komentar" };
  }
};

/**
 * 🔹 GET POST COMMENTS WITH USER INFO
 * Try to get comments with user information
 */
export const getPostCommentsWithUsers = async (id) => {
  try {
    // Try different endpoints to get comments with user info
    const endpoints = [
      `/posts/${id}/comments?include=user`,
      `/posts/${id}/comments`,
      `/posts/${id}?include=comments.user`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        console.log(`Comments from ${endpoint}:`, res.data);
        if (res.data && res.data.data) {
          return res.data;
        }
      } catch (err) {
        console.log(`Failed to get comments from ${endpoint}:`, err.message);
      }
    }
    
    throw new Error("No endpoint available for comments with user info");
  } catch (err) {
    console.error("Get comments with users error:", err);
    throw err.response?.data || { message: "Gagal mengambil komentar dengan info user" };
  }
};

/**
 * 🔹 GET USER INFO BY ID
 * Try to get user information by user ID
 */
export const getUserInfo = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}`);
    console.log("User info response:", res.data);
    return res.data;
  } catch (err) {
    console.error("Get user info error:", err.response || err);
    throw err.response?.data || { message: "Gagal mengambil info user" };
  }
};
