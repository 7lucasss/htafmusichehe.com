import React from 'react';
import { Link } from 'react-router-dom';
import { FaMusic, FaHeadphones, FaPlayCircle, FaCheck, FaChartLine, FaInfoCircle, FaPlay } from 'react-icons/fa';
import TopMusicSection from '../components/home/TopMusicSection';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-dark text-white py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-dark opacity-90 z-0"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">TẠO NHẠC KHÔNG TẠO CHIẾN</h1>
          <div className="w-24 h-1 bg-secondary mx-auto mb-12"></div>
          
          <div className="mt-8">
            <Link 
              to="/music" 
              className="bg-secondary text-primary px-8 py-4 rounded-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2 btn-ripple btn-float btn-glow btn-shine"
            >
              <FaPlay /> <span className="font-bold">KHÁM PHÁ NGAY</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className="bg-light py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            KHƠI DẬY <span className="text-secondary hover:text-primary transition duration-300">SÁNG TẠO</span> CỦA BẠN
          </h2>
          <h3 className="text-2xl md:text-3xl font-medium mb-12">TRỘN NHẠC TỐT HƠN VỚI CÔNG NGHỆ ĐỘT PHÁ CHO DJ</h3>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-2 right-2 bg-secondary text-white p-1 rounded text-xs z-10">
                Khách hàng thực tế
              </div>
              <p className="italic text-gray-700 mb-4">
                "HTaf Music là công cụ bạn có thể thử rất dễ dàng.<br />
                Nếu bạn chơi trong câu lạc bộ, nó cũng thật tuyệt...<br />
                Tôi đã rất ấn tượng, nó rất tuyệt!"
              </p>
              <p className="font-semibold">David Guetta</p>
              <p className="text-sm text-gray-500">DJ & Nhà sản xuất đa bạch kim</p>
            </div>
            
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-2 right-2 bg-secondary text-white p-1 rounded text-xs z-10">
                Đánh giá chuyên môn
              </div>
              <p className="italic text-gray-700 mb-4">
                "HTaf Music là phần mềm tuyệt vời...<br />
                Có những đổi mới đơn giản<br />
                không tồn tại trên phần mềm cạnh tranh."
              </p>
              <p className="font-semibold">DJ Mag</p>
              <p className="text-sm text-gray-500">Tạp chí DJ tham khảo</p>
            </div>
            
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-2 right-2 bg-secondary text-white p-1 rounded text-xs z-10">
                Lời chứng thực
              </div>
              <p className="italic text-gray-700 mb-4">
                "Nếu bạn là một người chơi scratch, một người chơi kỹ thuật..<br />
                bạn sẽ yêu thích điều này! Tiên tiến & chính xác.<br />
                HTaf Music... đúng vậy!"
              </p>
              <p className="font-semibold">Qbert</p>
              <p className="text-sm text-gray-500">DJ vô địch huyền thoại</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-8">BẮT ĐẦU VỚI HTAF MUSIC <span className="text-secondary">NGAY HÔM NAY!</span></h2>
          
          <div className="flex justify-center gap-4">
            <Link to="/music" className="bg-secondary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Xem các bài hát mới nhất
              </span>
              KHÁM PHÁ
            </Link>
            <Link to="/register" className="bg-primary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Tạo tài khoản mới
              </span>
              ĐĂNG KÝ
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-gradient-to-r from-primary to-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 hover:text-secondary transition duration-300 cursor-default">TƯƠNG LAI CỦA ÂM NHẠC Ở ĐÂY NGAY BÂY GIỜ</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="w-full md:w-1/2">
              <h3 className="text-3xl font-bold mb-2 group hover:text-secondary transition duration-300 cursor-default">
                TÁCH BẠN NHẠC | ÂM NHẠC TÁI SÁNG TẠO
                <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaInfoCircle className="text-xl" />
                </span>
              </h3>
              <div className="h-1 w-24 bg-secondary mb-6 hover:w-full transition-all duration-500"></div>
              <h4 className="text-2xl font-semibold mb-6 hover:text-secondary transition duration-300 cursor-default">TÁCH BẠN NHẠC THỜI GIAN THỰC</h4>
              <p className="text-lg mb-6 hover:bg-dark hover:bg-opacity-50 p-2 rounded transition-all duration-300">
                <strong>HTaf Music 2025</strong> sử dụng công nghệ tiên tiến và sức mạnh của máy tính hiện đại để cách mạng hóa những gì DJ có thể làm. Với phiên bản mới này, bạn có thể trộn các thành phần khác nhau của bản nhạc của bạn (giọng hát, nhạc cụ, nhịp đập, hihats, v.v.) theo thời gian thực. Điều này mở ra cánh cửa cho những cách trộn mới mà trước đây đơn giản là không thể thực hiện được, và sẽ mãi mãi thay đổi cách DJ trộn.
              </p>
              <p className="text-lg mb-6 hover:bg-dark hover:bg-opacity-50 p-2 rounded transition-all duration-300">
                Với tách bản nhạc thời gian thực trên bất kỳ bản nhạc nào, việc tạo mashup hoàn hảo trực tiếp và chuyển tiếp liền mạch giờ đây là tiêu chuẩn mới:
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start gap-2 hover:bg-dark p-2 rounded transition-all duration-300 group">
                  <FaCheck className="text-secondary mt-1 flex-shrink-0 group-hover:scale-125 transition-all duration-300" />
                  <span><strong className="group-hover:text-secondary transition duration-300">EQ hiện đại</strong> có thể đạt được sự tách biệt chính xác hơn nhiều so với bộ cân bằng truyền thống dựa trên tần số, và giúp đạt được sự chuyển tiếp hoàn hảo như chưa từng có trước đây.</span>
                </li>
                <li className="flex items-start gap-2 hover:bg-dark p-2 rounded transition-all duration-300 group">
                  <FaCheck className="text-secondary mt-1 flex-shrink-0 group-hover:scale-125 transition-all duration-300" />
                  <span>Các <strong className="group-hover:text-secondary transition duration-300">Stem pad</strong> mới sẽ cho phép bạn tạo mashup trực tiếp và remix theo thời gian thực một cách dễ dàng. Hãy để sự sáng tạo của bạn bay tự do.</span>
                </li>
              </ul>
              <Link to="/features" className="inline-block bg-secondary text-white px-6 py-3 font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transition-all duration-300 relative group">
                <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm left-0">
                  Tìm hiểu các tính năng
                </span>
                TÌM HIỂU THÊM
              </Link>
            </div>
            <div className="w-full md:w-1/2 hover:scale-105 transition-all duration-500">
              <img src="https://placehold.co/600x400/1a1a2e/4ecca3?text=HTaf+Music+Platform" alt="HTaf Music Platform" className="rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300" />
            </div>
          </div>
          
          {/* Small Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            <div className="bg-dark p-8 rounded-lg hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <h3 className="text-xl font-bold mb-4 group-hover:text-secondary transition duration-300">Acapella & Instrumental Tức Thời</h3>
              <p className="opacity-90 group-hover:opacity-100 transition duration-300">Công nghệ mới này giúp DJ có quyền truy cập vào acapella và instrumental ngay lập tức trên bất kỳ bài hát nào, trực tiếp trong quá trình mix! Tách bản nhạc theo thời gian thực cho phép bạn dễ dàng xóa hoặc tách riêng các phần của bài hát.</p>
            </div>
            <div className="bg-dark p-8 rounded-lg hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <h3 className="text-xl font-bold mb-4 group-hover:text-secondary transition duration-300">Mashup Ngay Tại Chỗ</h3>
              <p className="opacity-90 group-hover:opacity-100 transition duration-300">Trộn và remix các bài hát trực tiếp ngay tại chỗ. Đặt giọng hát từ một bài hát lên nhịp từ một bài hát khác và khám phá những cách mới để trộn các bản nhạc của bạn mà trước đây không thể thực hiện được.</p>
            </div>
            <div className="bg-dark p-8 rounded-lg hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <h3 className="text-xl font-bold mb-4 group-hover:text-secondary transition duration-300">Chuyển Tiếp Liền Mạch</h3>
              <p className="opacity-90 group-hover:opacity-100 transition duration-300">Tách bản nhạc ngay trên EQ cho phép DJ chuyển tiếp liền mạch theo những cách hoàn toàn mới, cho phép DJ tinh chỉnh các yếu tố khác nhau của bài hát trực tiếp trong mix.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-light py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-around items-center gap-8 mb-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-primary mb-4 hover:text-secondary transition duration-300 cursor-default">#1 PHẦN MỀM ÂM NHẠC ĐƯỢC ƯA CHUỘNG NHẤT</h3>
              <p className="text-lg hover:bg-gray-100 p-2 rounded transition-all duration-300">HTaf Music là phần mềm DJ được sử dụng nhiều nhất trên hành tinh, với hơn 100,000,000 lượt tải xuống. Có lý do tại sao mọi người bắt đầu với HTaf Music.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 hover:bg-white hover:shadow-lg rounded-lg transition-all duration-300 relative group cursor-pointer">
              <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
              <FaMusic className="text-6xl text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-bold mb-2 group-hover:text-secondary transition duration-300">Mạnh mẽ nhưng dễ sử dụng</h4>
              <p className="group-hover:font-medium transition duration-300">Tích hợp công nghệ DJ thông minh tiên tiến nhất và các tính năng trực quan, HTaf Music dễ học và làm chủ đối với bất kỳ DJ mới bắt đầu nào. Và nó miễn phí cho mục đích sử dụng không chuyên nghiệp.</p>
            </div>
            <div className="text-center p-6 hover:bg-white hover:shadow-lg rounded-lg transition-all duration-300 relative group cursor-pointer">
              <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
              <FaHeadphones className="text-6xl text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-bold mb-2 group-hover:text-secondary transition duration-300">TĂNG CƯỜNG BỘ ĐIỀU KHIỂN CỦA BẠN</h4>
              <p className="group-hover:font-medium transition duration-300">Đối với các DJ chuyên nghiệp, bằng cách sử dụng HTaf Music thay vì phần mềm hạn chế đi kèm với bộ điều khiển của bạn, bạn sẽ có công nghệ tiên tiến nhất trong tầm tay và thực hiện các bài mix tốt hơn.</p>
            </div>
            <div className="text-center p-6 hover:bg-white hover:shadow-lg rounded-lg transition-all duration-300 relative group cursor-pointer">
              <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
              <FaChartLine className="text-6xl text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-bold mb-2 group-hover:text-secondary transition duration-300">20 NĂM LÀ PHẦN MỀM DJ #1</h4>
              <p className="group-hover:font-medium transition duration-300">Với hơn một trăm triệu lượt tải xuống, HTaf Music là phần mềm DJ được sử dụng nhiều nhất trên hành tinh. Hỏi xung quanh, hầu hết các DJ đều quen thuộc với HTaf Music.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/about" className="inline-block bg-primary text-white px-6 py-3 font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Tìm hiểu lịch sử và sứ mệnh của chúng tôi
              </span>
              TÌM HIỂU THÊM
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gradient-to-r from-primary to-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 hover:text-secondary transition duration-300 cursor-default">TÍNH NĂNG ĐỈNH CAO TRONG NGÀNH</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Dễ sử dụng cho tất cả
              </div>
              <FaPlayCircle className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">GIAO DIỆN TRỰC QUAN</h4>
            </div>
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Hỗ trợ trình diễn trực tiếp
              </div>
              <FaMusic className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">VIDEO & KARAOKE</h4>
            </div>
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Âm thanh đỉnh cao
              </div>
              <FaHeadphones className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">NHIỀU HIỆU ỨNG</h4>
            </div>
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Đa luồng hiệu năng cao
              </div>
              <FaPlayCircle className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">4 BỘ NGUỒN (HOẶC HƠN)</h4>
            </div>
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Sáng tạo không giới hạn
              </div>
              <FaMusic className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">BỘ LẤY MẪU KHÔNG GIỚI HẠN</h4>
            </div>
            <div className="p-4 hover:bg-dark hover:scale-110 transition-all duration-300 rounded-lg cursor-pointer relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary text-primary px-2 py-1 rounded text-xs whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Tùy chỉnh mọi chi tiết
              </div>
              <FaHeadphones className="text-4xl text-secondary mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="text-lg font-semibold">TRÌNH CHỈNH SỬA MẠNH MẼ</h4>
            </div>
          </div>
          
          <div className="mb-12 relative group">
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark text-white px-4 py-2 rounded opacity-0 group-hover:opacity-90 transition-opacity duration-300 text-lg font-bold">Click để xem giao diện đầy đủ</span>
            <img src="https://placehold.co/1200x600/1a1a2e/4ecca3?text=HTaf+Music+Interface" alt="HTaf Music Interface" className="rounded-lg shadow-xl mx-auto group-hover:brightness-75 transition duration-300 cursor-pointer" />
          </div>
          
          <Link to="/features" className="inline-block bg-secondary text-white px-6 py-3 font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transition-all duration-300 relative group">
            <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
              Khám phá tất cả các tính năng
            </span>
            XEM CÁC TÍNH NĂNG
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-light py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 hover:text-secondary transition duration-300 cursor-default">NGHE HÀNG TRIỆU BÀI HÁT</h2>
          <p className="text-lg max-w-3xl mx-auto mb-8 hover:bg-white hover:shadow-md p-4 rounded-lg transition-all duration-300">
            HTaf Music cho phép bạn stream các bản nhạc từ các catalogs đối tác của chúng tôi trực tiếp trong phần mềm. Phát bất cứ thứ gì từ hàng triệu bài hát có sẵn, khám phá các bản nhạc mới từ các bảng xếp hạng được thiết kế riêng, và tạo playlist của riêng bạn một cách dễ dàng. Từ mainstream đến underground, mọi thứ đều có sẵn ngay trong tầm tay của bạn. Tất cả đều ở định dạng chất lượng cao.
          </p>
          <Link to="/catalogs" className="inline-block bg-primary text-white px-6 py-3 font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transition-all duration-300 mb-12 relative group">
            <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
              Xem danh sách các đối tác
            </span>
            TÌM HIỂU THÊM
          </Link>
          
          <h2 className="text-3xl font-bold mb-12 hover:text-secondary transition duration-300 cursor-default">NHẬN HTAF MUSIC NGAY HÔM NAY!</h2>
          <div className="flex justify-center gap-4">
            <Link to="/music" className="bg-secondary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Xem các bài hát mới nhất
              </span>
              KHÁM PHÁ
            </Link>
            <Link to="/register" className="bg-primary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Tạo tài khoản mới
              </span>
              ĐĂNG KÝ
            </Link>
          </div>
        </div>
      </div>

      {/* Thêm phần Top Music Section */}
      <TopMusicSection />

      {/* PHẦN TUYỂN DỤNG DJ */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">KÊNH TUYỂN DỤNG <span className="text-secondary">DJ</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Tuyển dụng 1 */}
            <div className="bg-dark rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="h-32 bg-gradient-to-r from-secondary to-blue-500 relative">
                <img src="https://placehold.co/120/1a1a2e/ffffff?text=Sky+Bar" alt="Sky Bar" className="absolute bottom-0 left-4 transform translate-y-1/2 w-16 h-16 rounded-full border-4 border-dark object-cover" />
              </div>
              <div className="p-6 pt-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">DJ tại Sky Bar</h3>
                    <p className="text-gray-400">Hà Nội</p>
                  </div>
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-sm">Toàn thời gian</span>
                </div>
                <p className="text-gray-300 mb-4">Tìm kiếm DJ có kinh nghiệm trong EDM, House và Dance music. Có khả năng sáng tạo playlist và tương tác với khách hàng.</p>
                <div className="flex justify-between items-center">
                  <p className="text-secondary font-bold">15-25 triệu/tháng</p>
                  <button className="bg-secondary text-primary px-4 py-2 rounded hover:bg-opacity-90 transition-colors">Ứng tuyển</button>
                </div>
              </div>
            </div>
            
            {/* Tuyển dụng 2 */}
            <div className="bg-dark rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="h-32 bg-gradient-to-r from-purple-500 to-red-500 relative">
                <img src="https://placehold.co/120/1a1a2e/ffffff?text=Lush" alt="Lush Club" className="absolute bottom-0 left-4 transform translate-y-1/2 w-16 h-16 rounded-full border-4 border-dark object-cover" />
              </div>
              <div className="p-6 pt-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">DJ cuối tuần tại Lush Club</h3>
                    <p className="text-gray-400">TP. Hồ Chí Minh</p>
                  </div>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-sm">Bán thời gian</span>
                </div>
                <p className="text-gray-300 mb-4">Cần DJ chơi nhạc Hip Hop, R&B vào cuối tuần. Ưu tiên người có kinh nghiệm tại các club lớn.</p>
                <div className="flex justify-between items-center">
                  <p className="text-secondary font-bold">2-3 triệu/đêm</p>
                  <button className="bg-secondary text-primary px-4 py-2 rounded hover:bg-opacity-90 transition-colors">Ứng tuyển</button>
                </div>
              </div>
            </div>
            
            {/* Tuyển dụng 3 */}
            <div className="bg-dark rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="h-32 bg-gradient-to-r from-yellow-500 to-red-500 relative">
                <img src="https://placehold.co/120/1a1a2e/ffffff?text=Mirage" alt="Mirage" className="absolute bottom-0 left-4 transform translate-y-1/2 w-16 h-16 rounded-full border-4 border-dark object-cover" />
              </div>
              <div className="p-6 pt-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Resident DJ tại Mirage</h3>
                    <p className="text-gray-400">Đà Nẵng</p>
                  </div>
                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-sm">Hợp đồng</span>
                </div>
                <p className="text-gray-300 mb-4">Tìm DJ thường trú có kinh nghiệm chơi đa dạng thể loại nhạc. Yêu cầu kỹ năng mix chuyên nghiệp và sáng tạo.</p>
                <div className="flex justify-between items-center">
                  <p className="text-secondary font-bold">18-30 triệu/tháng</p>
                  <button className="bg-secondary text-primary px-4 py-2 rounded hover:bg-opacity-90 transition-colors">Ứng tuyển</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 mb-6">Bạn là chủ quán bar hay club? Đăng tin tuyển dụng để tiếp cận hàng ngàn DJ tài năng trên HTaf Music</p>
            <div className="flex justify-center space-x-4">
              <Link to="/jobs" className="bg-secondary text-primary px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-colors">Xem tất cả tin tuyển dụng</Link>
              <Link to="/post-job" className="bg-dark text-white border border-secondary px-6 py-3 rounded-md font-bold hover:bg-secondary hover:text-primary transition-colors">Đăng tin tuyển dụng</Link>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN CTA CUỐI TRANG */}
      <div className="bg-light py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 hover:text-secondary transition duration-300 cursor-default">NHẬN HTAF MUSIC NGAY HÔM NAY!</h2>
          <div className="flex justify-center gap-4">
            <Link to="/music" className="bg-secondary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Xem các bài hát mới nhất
              </span>
              KHÁM PHÁ
            </Link>
            <Link to="/register" className="bg-primary text-white px-8 py-4 text-xl font-bold rounded-md hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative group">
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark text-white px-2 py-1 rounded text-sm whitespace-nowrap left-1/2 transform -translate-x-1/2">
                Tạo tài khoản mới
              </span>
              ĐĂNG KÝ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 