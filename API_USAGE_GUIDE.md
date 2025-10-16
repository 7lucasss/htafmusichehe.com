# Hướng Dẫn Sử Dụng API - HTaf Music Platform

## API Calls Tạo Nghệ Sĩ, Playlist và Thể Loại

### 1. NGHỆ SĨ (ARTISTS)

#### Lấy danh sách nghệ sĩ
```javascript
import adminApi from '../services/adminApi';

// Lấy tất cả nghệ sĩ
const artists = await adminApi.getArtists();
console.log(artists.data.data); // Mảng các nghệ sĩ
```

#### Tạo nghệ sĩ mới
```javascript
const newArtist = {
  name: 'Sơn Tùng M-TP',
  bio: 'Ca sĩ, rapper và nhạc sĩ người Việt Nam',
  imageUrl: 'https://example.com/avatar.jpg', // Tùy chọn
  genres: ['Pop', 'Rap'], // Tùy chọn
  socialLinks: { // Tùy chọn
    facebook: 'https://facebook.com/sontungmtp',
    instagram: 'https://instagram.com/sontungmtp'
  }
};

const response = await adminApi.createArtist(newArtist);
console.log('Nghệ sĩ đã tạo:', response.data.data);
```

#### Cập nhật nghệ sĩ
```javascript
const updatedData = {
  bio: 'Bio đã cập nhật',
  monthlyListeners: 1000000
};

await adminApi.updateArtist(artistId, updatedData);
```

#### Xóa nghệ sĩ
```javascript
await adminApi.deleteArtist(artistId);
```

### 2. PLAYLIST

#### Lấy danh sách playlist
```javascript
const playlists = await adminApi.getPlaylists();
console.log(playlists.data.data);
```

#### Tạo playlist mới
```javascript
const newPlaylist = {
  name: 'Top Hits 2024',
  description: 'Những bài hát hot nhất năm 2024',
  genre: 'Pop', // Tùy chọn
  coverImage: 'https://example.com/cover.jpg', // Tùy chọn
  songs: [songId1, songId2], // Mảng ID bài hát
  isPublic: true // Mặc định true
};

const response = await adminApi.createPlaylist(newPlaylist);
console.log('Playlist đã tạo:', response.data.data);
```

#### Cập nhật playlist
```javascript
const updatedData = {
  description: 'Mô tả mới',
  songs: [songId1, songId2, songId3] // Thêm bài hát mới
};

await adminApi.updatePlaylist(playlistId, updatedData);
```

#### Xóa playlist
```javascript
await adminApi.deletePlaylist(playlistId);
```

### 3. THỂ LOẠI (GENRES)

#### Lấy danh sách thể loại
```javascript
// Lấy tất cả thể loại đang hoạt động
const genres = await adminApi.getGenres();
console.log(genres.data.data);

// Lấy thể loại phổ biến (theo số lượng bài hát)
const popularGenres = await adminApi.getPopularGenres(10);
console.log(popularGenres.data.data);
```

#### Tạo thể loại mới
```javascript
const newGenre = {
  name: 'Lo-fi Hip Hop',
  description: 'Nhạc lo-fi với beats thư giãn',
  color: '#ff6b6b', // Màu sắc đại diện
  sortOrder: 15 // Thứ tự sắp xếp
};

const response = await adminApi.createGenre(newGenre);
console.log('Thể loại đã tạo:', response.data.data);
```

#### Cập nhật thể loại
```javascript
const updatedData = {
  description: 'Mô tả mới',
  color: '#4ecdc4',
  sortOrder: 1
};

await adminApi.updateGenre(genreId, updatedData);
```

#### Xóa thể loại
```javascript
// Lưu ý: Chỉ có thể xóa thể loại không được sử dụng bởi bài hát nào
await adminApi.deleteGenre(genreId);
```

## Sử Dụng Trong Component React

### Example: Component quản lý nghệ sĩ
```javascript
import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const ArtistManager = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await adminApi.getArtists();
      setArtists(response.data.data);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtist = async (artistData) => {
    try {
      await adminApi.createArtist(artistData);
      fetchArtists(); // Reload danh sách
    } catch (error) {
      console.error('Error creating artist:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {artists.map(artist => (
        <div key={artist._id}>
          <h3>{artist.name}</h3>
          <p>{artist.bio}</p>
        </div>
      ))}
    </div>
  );
};
```

## Script Khởi Tạo Dữ Liệu

### Chạy script tạo thể loại mặc định
```bash
cd server
npm run seed:genres
```

Script này sẽ tạo 14 thể loại nhạc mặc định:
- Pop, Rock, Hip-hop, R&B, Jazz
- Electronic, Classical, Folk, Country
- Blues, Indie, Rap, Nhạc Việt, Acoustic

## Lưu Ý Quan Trọng

### 1. Authentication
Tất cả API tạo/sửa/xóa đều yêu cầu quyền Admin:
```javascript
// Token sẽ tự động được gắn vào request headers
// Đảm bảo user đã đăng nhập và có role 'admin'
```

### 2. Error Handling
```javascript
try {
  const response = await adminApi.createArtist(data);
  // Success
} catch (error) {
  if (error.response) {
    // Server trả về lỗi
    console.log(error.response.data.message);
  } else {
    // Network error
    console.log('Network error');
  }
}
```

### 3. Validation
- **Artist**: `name` là bắt buộc
- **Playlist**: `name` là bắt buộc
- **Genre**: `name` là bắt buộc và unique

### 4. Quan hệ dữ liệu
- Song -> Artist (many-to-one)
- Song -> Album (many-to-one, optional)
- Song -> Genre (many-to-one, string)
- Playlist -> Songs (many-to-many)

## API Endpoints

### Artists
- `GET /api/artists` - Lấy danh sách nghệ sĩ
- `POST /api/artists` - Tạo nghệ sĩ mới
- `GET /api/artists/:id` - Lấy thông tin nghệ sĩ
- `PUT /api/artists/:id` - Cập nhật nghệ sĩ
- `DELETE /api/artists/:id` - Xóa nghệ sĩ

### Playlists
- `GET /api/playlists` - Lấy danh sách playlist
- `POST /api/playlists` - Tạo playlist mới
- `GET /api/playlists/:id` - Lấy thông tin playlist
- `PUT /api/playlists/:id` - Cập nhật playlist
- `DELETE /api/playlists/:id` - Xóa playlist

### Genres
- `GET /api/genres` - Lấy danh sách thể loại
- `GET /api/genres/popular` - Lấy thể loại phổ biến
- `POST /api/genres` - Tạo thể loại mới
- `GET /api/genres/:id` - Lấy thông tin thể loại
- `PUT /api/genres/:id` - Cập nhật thể loại
- `DELETE /api/genres/:id` - Xóa thể loại

## Testing

Để test các API calls, bạn có thể:

1. Sử dụng component `GenreManagement` đã tạo
2. Sử dụng Postman/Insomnia với endpoints trên
3. Kiểm tra Network tab trong Developer Tools

## Troubleshooting

### Lỗi thường gặp:
1. **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền admin
2. **400 Bad Request**: Thiếu trường bắt buộc hoặc dữ liệu không hợp lệ
3. **404 Not Found**: ID không tồn tại
4. **500 Internal Server Error**: Lỗi server, kiểm tra console log 