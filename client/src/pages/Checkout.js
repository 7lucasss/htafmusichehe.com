import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const Message = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const Checkout = () => {
  return (
    <Container>
      <Title>Thanh toán</Title>
      <Message>Trang thanh toán sẽ được hiển thị tại đây...</Message>
    </Container>
  );
};

export default Checkout; 