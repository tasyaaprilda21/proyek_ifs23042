import React, { useEffect, useState } from "react";
import { getMyProfile } from "../services/userService";

export default function About() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <p className="text-center mt-5">Memuat...</p>;

  return (
    <div className="container mt-5" style={{ maxWidth: 720 }}>
      <div className="card p-4 shadow-sm">
        <h3>Tentang Saya</h3>
        <div className="text-center">
          <img
            src={user.photo}
            alt="profile"
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              objectFit: "cover",
            }}
          />
        </div>
        <p>
          <strong>Nama:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-muted">
          Akun dibuat pada {new Date(user.created_at).toLocaleDateString()}
        </p>
        <hr />
        <p>Halo! Saya {user.name} — ini halaman About saya.</p>
      </div>
    </div>
  );
}





