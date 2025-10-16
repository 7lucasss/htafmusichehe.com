import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCreditCard, FaMoneyBill, FaSpinner, FaMusic, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Cart = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    } else if (currentUser) {
      fetchCart();
    }
  }, [currentUser, loading, navigate]);
  
  const fetchCart = async () => {
    setLoadingCart(true);
    setError(null);
    
    try {
      const response = await API.getCart();
      setCartItems(response.data);
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoadingCart(false);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    try {
      await API.removeFromCart(itemId);
      // Update cart after removal
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
      console.error(err);
    }
  };
  
  const handleCheckout = async () => {
    setProcessingCheckout(true);
    setError(null);
    
    try {
      const response = await API.checkout({ paymentMethod: selectedPaymentMethod });
      // Navigate to success page or show success message
      navigate('/checkout/success', { state: { orderDetails: response.data } });
    } catch (err) {
      setError('Thanh toán thất bại. Vui lòng thử lại sau.');
      console.error(err);
      setProcessingCheckout(false);
    }
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.songId.discountPrice || item.songId.price;
      return total + price;
    }, 0);
  };
  
  if (loading || loadingCart) {
    return (
      <div className="min-h-screen bg-dark text-white flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-secondary mx-auto mb-4" />
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Giỏ hàng</h1>
          <Link to="/music" className="text-secondary hover:underline flex items-center gap-2">
            <FaArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" /> {error}
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="bg-primary bg-opacity-30 rounded-lg p-8 text-center">
            <FaShoppingCart className="text-5xl mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-400 mb-6">Hãy khám phá và thêm những bài hát yêu thích vào giỏ hàng</p>
            <Link to="/music" className="inline-block bg-secondary text-primary font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
              Khám phá bài hát
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-primary bg-opacity-30 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-primary p-4 font-semibold text-gray-300">
                  <div className="col-span-6">Bài hát</div>
                  <div className="col-span-2">Định dạng</div>
                  <div className="col-span-2">Giá</div>
                  <div className="col-span-2 text-right">Thao tác</div>
                </div>
                
                {cartItems.map(item => (
                  <div key={item._id} className="grid grid-cols-12 p-4 border-b border-gray-700 items-center hover:bg-primary hover:bg-opacity-20 transition-colors">
                    <div className="col-span-6">
                      <div className="flex items-center">
                        <img 
                          src={item.songId.coverUrl || "https://placehold.co/80/1a1a2e/ffffff?text=Cover"} 
                          alt={item.songId.title}
                          className="w-12 h-12 object-cover rounded mr-4"
                        />
                        <div>
                          <Link to={`/music/${item.songId._id}`} className="font-medium hover:text-secondary transition-colors">
                            {item.songId.title}
                          </Link>
                          <p className="text-sm text-gray-400">{item.songId.artist}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-1 bg-primary rounded text-xs uppercase">
                        {item.format}
                      </span>
                    </div>
                    <div className="col-span-2">
                      {item.songId.discountPrice ? (
                        <div>
                          <span className="font-bold text-secondary">{item.songId.discountPrice.toLocaleString('vi-VN')}đ</span>
                          <span className="text-gray-400 line-through text-sm ml-2">{item.songId.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ) : (
                        <span className="font-bold">{item.songId.price.toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <button 
                        onClick={() => handleRemoveItem(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Xóa khỏi giỏ hàng"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-primary bg-opacity-30 rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-700">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tổng số sản phẩm:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-secondary">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Phương thức thanh toán</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 p-3 rounded bg-primary bg-opacity-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card" 
                        checked={selectedPaymentMethod === 'card'}
                        onChange={() => setSelectedPaymentMethod('card')}
                        className="accent-secondary"
                      />
                      <FaCreditCard className="text-secondary" />
                      <span>Thẻ tín dụng/ghi nợ</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 p-3 rounded bg-primary bg-opacity-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="banking" 
                        checked={selectedPaymentMethod === 'banking'}
                        onChange={() => setSelectedPaymentMethod('banking')}
                        className="accent-secondary"
                      />
                      <FaMoneyBill className="text-secondary" />
                      <span>Chuyển khoản ngân hàng</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={processingCheckout}
                  className="w-full bg-secondary text-primary py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processingCheckout ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" /> Thanh toán
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 