import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  text-align: center;
  padding: 5rem 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: #4ecca3;
  color: #1a1a2e;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
`;

const NotFound = () => {
  return (
    <Container>
      <Title>404 - Trang không tìm thấy</Title>
      <Message>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</Message>
      <Button to="/">Quay lại trang chủ</Button>
    </Container>
  );
};

export default NotFound; 