import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import SongCard from '../components/common/SongCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const SectionTitle = styled.h2`
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: #555;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const SongGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const Rankings = () => {
  const [topPlayedSongs, setTopPlayedSongs] = useState([]);
  const [topLikedSongs, setTopLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);
        const [playedRes, likedRes] = await Promise.all([
          api.songApi.getSongs({ sort: '-playCount', limit: 10 }), // Re-using getSongs with sort
          api.songApi.getTopLikedSongs(10)
        ]);
        setTopPlayedSongs(playedRes.data);
        setTopLikedSongs(likedRes.data);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError('Không thể tải bảng xếp hạng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Container>
      <Title>Bảng Xếp Hạng Bài Hát</Title>

      <SectionTitle>Top 10 Bài Hát Được Nghe Nhiều Nhất</SectionTitle>
      {topPlayedSongs.length > 0 ? (
        <SongGrid>
          {topPlayedSongs.map(song => (
            <SongCard key={song._id} song={song} />
          ))}
        </SongGrid>
      ) : (
        <p>Không có bài hát nào trong danh sách này.</p>
      )}

      <SectionTitle>Top 10 Bài Hát Được Yêu Thích Nhất</SectionTitle>
      {topLikedSongs.length > 0 ? (
        <SongGrid>
          {topLikedSongs.map(song => (
            <SongCard key={song._id} song={song} />
          ))}
        </SongGrid>
      ) : (
        <p>Không có bài hát nào trong danh sách này.</p>
      )}
    </Container>
  );
};

export default Rankings; 